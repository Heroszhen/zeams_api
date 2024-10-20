const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
    originalName: String, 
    newName: String,
    fileType: String,
    link: String,
    created: { type: Date, default: Date.now },
    sender: {type: mongoose.Schema.Types.ObjectId, ref:'user'}, 
});

const fileModel = mongoose.model("file", fileSchema);
exports.model =  fileModel;