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