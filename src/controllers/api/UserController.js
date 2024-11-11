const bcrypt = require('bcrypt');
const userModel = require("../../models/User");
const utilService = require("../../services/UtilService");
const auth = require("../../middlewares/auth");
const S3Service = require("../../services/S3Service");
const s3Service = new S3Service();
const fileModel = require('../../models/File');
const conversationModel = require('../../models/Conversation');
const multer = require('multer');
const upload = multer().single('file');
const uniqid = require('uniqid');

exports.login = async (req, res) => {
    const post = req.body;
    let user = await userModel.model.findOne({"email": post.email});
    if (user !== null) {
        let result = await bcrypt.compare(post.password, user.password);
        if (result) {
            return res.json({token: utilService.getToken({
                '_id': user._id.toString(),
                'email': user.email
            })});
        }
    }

    return res.status(404).json({"message": "Account not found"});
}

exports.getProfile  = async (req, res) => {
    // const user = await userModel.model.findOne({'_id': req.params.id}).exec();
    // if (user === null)return res.status(404).json();
    // if (!auth.checkAccess(req.session.user, user)) {
    //     return res.status(403).json({"message": "Access denied"});
    // }
    const user = req.session.user;

    return res.json({"data": {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        photo: user.photo,
        created: user.created
    }});
}

exports.editProfile  = async (req, res) => {
    const user = req.session.user;

    const post = req.body;
    user.name = post.name;
    user.email = post.email;
    try {
        await user.save();
    } catch(err) {
        return res.status(400).json({message: err.message});
    }
    
    return res.json({"data": {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        photo: user.photo,
        created: user.created
    }});
}

exports.editProfilePhoto  = async (req, res) => {
    const user = req.session.user;

    upload(req, res, async function (err) {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({"message": err.message});
        } else if (err) {
            return res.status(400).json({"message": err.message});
        }
        
        if (req.file === undefined) {
            return res.status(400).json({"message": "File is missed"});
        }
        if (!req.file.mimetype.includes('image')) {
            return res.status(400).json({"message": "Unsupported format"});
        }
        const oldPhoto = user.photo;
        const newName = uniqid('profile_') + ".png";
        user.photo = await s3Service.addFile(req.file.buffer, newName, req.file.mimetype);
        await user.save();
        if(oldPhoto) {
            const tab = oldPhoto.split('/');
            await s3Service.deleteFile(tab[tab.length - 1]);
        }

        return res.status(201).json({"data": {
            _id: user._id.toString(),
            name: user.name,
            email: user.email,
            photo: user.photo,
            created: user.created
        }});
    });
}

exports.getInterlocutors  = async (req, res) => {
    try {
        const user = req.session.user

        let interlocutors = [];
        let conversations = [];
        for(let item of user.interlocutors) {
            let interlocutor = await userModel.model.findById(item.user._id).select(['_id', 'name', 'photo']);
            interlocutor.created = item.created;
            interlocutors.push(interlocutor);

            let result = await conversationModel.findBySenderAndReceiver(user, item.user);
            conversations = conversations.concat(result);
        }

        return res.json({
            interlocutors: interlocutors,
            conversations: conversations
        });
    } catch(err) {console.log(err)
        return res.status(400).json();
    }
}

exports.addInterlocutors  = async (req, res) => {
    try {
        const user = await userModel.model.findOne({'_id': req.params.id})
        if (!auth.checkAccess(req.session.user, user)) {
            return res.status(403).json();
        }

        const interlocutor = await userModel.model
                                .findOne({'_id': req.body.id})
                                .select(["_id", "name", "photo"]);
        let checked = true;
        for(let entry of user.interlocutors) {
            if(entry.user.toString() === interlocutor._id.toString()) {
                checked = false;
                break;
            }
        }

        let conversations = [];
        if (checked){
            user.interlocutors.push({user: interlocutor});
            await user.save();

            let result = await conversationModel.findBySenderAndReceiver(user, interlocutor);
            conversations = conversations.concat(result.reverse());
        }

        return res.status(201).json({
            interlocutor: interlocutor,
            conversations: conversations
        });
    } catch(err) {
        return res.status(400).json();
    }
}

exports.deleteInterlocutors  = async (req, res) => {
    try {
        const user = await userModel.model.findOne({'_id': req.params.id})
        if (!auth.checkAccess(req.session.user, user)) {
            return res.status(403).json();
        }
        user.interlocutors = user.interlocutors.filter(item => item.user.toString() !== req.params.id2);
        await user.save();
        
        return res.status(204).json();
    } catch(err) {
        return res.status(400).json();
    }
}