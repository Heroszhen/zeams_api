const userModel = require('../../models/User');
const bcrypt = require('bcrypt');
const S3Service = require("../../services/S3Service");
const s3Service = new S3Service();

exports.test = async function(req, res){
    // let hash = await bcrypt.hash("aaaaaaaa", parseInt(process.env.BCRYPT_SALTROUNDS));
    // let result = await userModel.model.create({
    //     name: "zhen",
    //     email: "herosgogogogo@gmail.com",
    //     password: hash,
    // });
    s3Service.getObject()
    let user = await userModel.model.find();

    res.json({
        result : user,
        s3: s3Service,
        env: process.env.APP_ENV
    });
}