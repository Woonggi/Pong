const RoomManager = require('./room_manager');

module.exports = class lobby {
    constructor() {
        this.players = [];
        this.room_manager = new RoomManager();
    }

    add_player(id) {
        this.players.push(id);
        console.log(id + " has joined to lobby");
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