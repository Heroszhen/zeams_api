const fileModel = require('../../models/File');
const conversationModel = require('../../models/Conversation');
const userModel = require('../../models/User');

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