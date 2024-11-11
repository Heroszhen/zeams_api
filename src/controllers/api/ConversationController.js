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
        const user = req.session.user;
        const user2 = await userModel.model.findById(req.params.id);
        let conversations = [];
        if ([undefined, ''].includes(req.query.last)) {
            conversations = await conversationModel.findBySenderAndReceiver(user, user2);
        } else {
            const last = await conversationModel.model.findById(req.query.last);  
            conversations = await conversationModel.findBySenderAndReceiver(user, user2, last);
        }

        return res.json({"conversations": conversations});
    } catch(err) {
        return res.status(400).json();
    }
}

exports.addConversation = async (req, res) => {
    try {
        const user = req.session.user
        uploads(req, res, async function (err) {
            let receiver = await userModel.model.findById(req.body.receiver);
            let checked = false, interlocutor = null;
            for(let i = 0; i < user.interlocutors.length; i++) {
                if (user.interlocutors[i].user._id.toString() === req.body.receiver) {
                    user.interlocutors[i].created = new Date();
                    checked = true;
                    break;
                }
            }
            if(!checked) {
                user.interlocutors.push({user:receiver});
            }
            await user.save();

            checked = false;
            for(let i = 0; i < receiver.interlocutors.length; i++) {
                if (receiver.interlocutors[i].user._id.toString() === user._id.toString()) {
                    receiver.interlocutors[i].created = new Date();
                    checked = true;
                    break;
                }
            }

            receiver = {
                _id: receiver._id,
                name: receiver.name,
                photo: receiver.photo,
                created: new Date(),
            }

            let tab = [];
            if (req.files) {
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

            return res.status(201).json({conversation:conversation, interlocutor:interlocutor});
        });
    } catch (err) {
        return res.status(400).json();
    }
}