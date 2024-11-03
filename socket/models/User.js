module.exports = class User {
    constructor(socketId, profile = null) {
        this.socketId = socketId;
        this.profile = profile;
    }
}