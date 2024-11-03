const fileModel = require('../../models/File');
const conversationModel = require('../../models/Conversation');
const userModel = require('../../models/User');
const multer = require('multer');
const upload = multer().single('file');
const uploads = multer().array('files', 5);
const uniqid = require('uniqid');
const fileService = require('../../services/FileService');

exports.getConversations = async (req, res) => {
    try {
        const user = await userModel.model.findById(req.params.id);
        const user2 = await userModel.model.findById(req.params.id2);
        let conversations = [];
        if ([undefined, ''].includes(req.query.last)) {
            conversations = await conversationModel.model.find({
                $or: [{sender: user, receiver: user2}, {sender: user2, receiver: user}]
            })
            .limit(10)
            .sort({created: -1});
        } else {
            const last = await conversationModel.model.findById(req.query.last);
            conversations = await conversationModel.model.find({
                $and: [
                    {created: {$lt: last.created}},
                    {$or: [{sender: user, receiver: user2}, {sender: user2, receiver: user}]}
                ]
            })
            .limit(10)
            .sort({created: -1});  
        }

        return res.json({"data": conversations.reverse()});
    } catch(err) {
        return res.status(400).json();
    }
}

exports.addConversation = async (req, res) => {
    try {
        const user = req.session.user
        uploads(req, res, async function (err) {
            const receiver = await userModel.model.findById(req.body.receiver);
            for(let i = 0; i < user.interlocutors.length; i++) {
                if (user.interlocutors[i].user._id === req.body.receiver) {
                    user.interlocutors[i].created = new Date();
                    break;
                }
            }

            let tab = [];
            if (req.files) {
                console.log(req.files)
                for(let entry of req.files) {
                    const file = await fileService.addFile(entry, uniqid('profile_') + entry.originalname, user);
                    tab.push(file);
                }
            }

            let conversation = await conversationModel.model.create({
                text: req.body.text,
                sender: user,
                receiver: receiver,
                files: tab
            });
            conversation = await conversationModel.model.findById( conversation._id.toString()).populate('files');

            return res.status(201).json({conversation});
        });
    } catch (err) {
        return res.status(400).json();
    }
}