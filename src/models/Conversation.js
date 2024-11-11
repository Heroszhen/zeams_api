const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema({
    text: String, 
    files: [
        {type: mongoose.Schema.Types.ObjectId, ref: 'file'}
    ],
    created: { type: Date, default: Date.now },
    sender: {type: mongoose.Schema.Types.ObjectId, ref:'user'}, 
    receiver: {type: mongoose.Schema.Types.ObjectId, ref:'user'}, 
});

const conversationModel = mongoose.model("conversation", conversationSchema);
exports.model =  conversationModel;

exports.findBySenderAndReceiver = async function(user1, user2, last = null) {
    let tab = [];

    if (last === null) {
        tab = await conversationModel.find({
            $or: [{sender: user1, receiver: user2}, {sender: user2, receiver: user1}]
        })
        .limit(10)
        .sort({created: -1})
        .populate('files')
        ;  
    } else {
        tab = await conversationModel.find({
            $and: [
                {created: {$lt: last.created}},
                {$or: [{sender: user1, receiver: user2}, {sender: user2, receiver: user1}]},
                { _id: { $ne: last._id } }
            ]
        })
        .limit(10)
        .sort({created: -1})
        .populate('files')
        ;  
    }

    return tab.reverse();
}