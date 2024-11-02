module.exports = class User {
    constructor(socketId, _id = '', name = '') {
        this.socketId = socketId;
        this._id = _id;
        this.name = name;
    }
}