const S3Service = require("./S3Service");
const s3Service = new S3Service();
const fileModel = require('../models/File');

exports.addFile = async (file, newName, user) => {
    const fileLink = await s3Service.addFile(file.buffer, newName, file.mimetype);

    return await fileModel.model.create({
        originalName: file.originalname, 
        newName: newName,
        fileType: file.mimetype,
        link: fileLink,
        sender: user 
    });
}