const utilService = require('../services/UtilService');
const userModel = require('../models/User');

exports.checkToken = async (req, res, next) => {
    const headers = req.headers;

    if (headers['x-requested-with'] === 'XMLHttpRequest') {
        let tab = headers['authorization'].split(" ");
        let decoded = utilService.decodeToken(tab[1]);
        let now = new Date();
        let loginTime = new Date(decoded.created);
        let diff = now - loginTime;//milliseconds
        let days = diff / 1000 / 60 / 60 / 24; 
        if (days < 1) {
            let user = await userModel.model.findById(decoded['_id']).exec();
            if (user !== null) {
                req.session.user = user;
                next();
                return;
            }
        }
    }
   
    return res.status(401).json();
}

exports.checkAccess = (connected, data, isUser = false) => {
    if (connected.roles.includes('admin'))return true;

    if (isUser) {
        if (connected._id.toString() === data._id.toString())return true;
    } else {
        if (connected._id.toString() === data.sender._id.toString())return true;
    }

    return false;
}