const RoomManager = require('./room_manager');

module.exports = class lobby {
    constructor() {
        this.players = [];
        this.room_manager = new RoomManager();
    }

    add_player(id, username) {
        let player = {
            id: id,
            username: username
        }
        this.players.push(player);
        console.log(username + " has joined");
    }

    remove_player(id) {
        for (var i = 0; i < this.players.length; ++i) {
            if(id === players[i].id){
                delete players[i];
            }
        }
    }

    get_num_player() {
        return this.players.length;
    }
    
}