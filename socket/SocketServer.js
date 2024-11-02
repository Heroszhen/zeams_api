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
        socket.on('disconnect', () => {
            this.removeUser(socket.id);
        });
    }

    addUser(socketId) {
        let index = this.getUserIndexBySocketId(socketId);
        if (index === null) {
            let user = new User(socketId);
            this.allUsers.push(user);
        }
    }

    removeUser(socketId) {
       
    }

    getUserIndexBySocketId(socketId) {
        for (let index in this.allUsers) {
            if (this.allUsers[index]['socketId'] === socketId) {
                return index;
            }
        }
        return null;
    }
}