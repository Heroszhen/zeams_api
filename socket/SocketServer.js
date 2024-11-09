const { Server } = require('socket.io');
const User = require("./models/User");

module.exports = class SocketServer {
    constructor(server) {
        this.allUsers = [];

        this.io = new Server(
            server, 
            {
                cors: {
                    origin: "*"
                }
            }
        );
        this.io.on('connection', (socket) => { this.onConnection(socket); });
    }

    onConnection(socket) {
        this.addUser(socket.id);
        socket.on('disconnect', () => {
            this.removeUser(socket.id);
        });

        socket.on("client:user:setUserInfo", this.setUserInfo.bind(this, socket));
        socket.on("client:conversation:sendMessage", this.sendChatMessage.bind(this, socket));
    }

    addUser(socketId) {
        let index = this.getUserIndexBySocketId(socketId);
        if (index === null) {
            let user = new User(socketId);
            this.allUsers.push(user);
        }
    }

    removeUser(socketId) {
        let index = this.getUserIndexBySocketId(socketId);
        if (index !== null) {
            this.allUsers.splice(index, 1);
        }
    }

    getUserIndexBySocketId(socketId) {
        for (let index in this.allUsers) {
            if (this.allUsers[index]['socketId'] === socketId) {
                return index;
            }
        }
        return null;
    }

    setUserInfo(socket, data) {
        let index = this.getUserIndexBySocketId(socket.id);
        if (index !== null) {
            this.allUsers[index].profile = data.profile;
            socket.broadcast.emit('server:user:sendProfile', data.profile);
        }
    }

    sendChatMessage(socket, data) {
        socket.emit('server:conversation:sendMessage', data);
        for(let user of this.allUsers) {
            if (user.profile?._id === data.conversation.receiver) {
                this.io.to(user.socketId).emit('server:conversation:sendMessage', data);
                break;
            }
        }
    }
}