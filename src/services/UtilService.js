const jwt = require('jsonwebtoken');

exports.getToken = (data) => {
    return jwt.sign({...data, created: new Date()}, process.env.JWT_SECRET);
}

exports.decodeToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch(err) {
    }
}