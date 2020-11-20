const RoomManager = require('./room_manager');

module.exports = class lobby {
    constructor() {
        this.players = [];
        this.private_players = {};
        this.room_manager = new RoomManager();
    }

    add_player(id, username, room_code = "public") {
        let player = {
            id: id,
            username: username,
            room_code: room_code
        }
        if(player.room_code === "public") {
            this.players.push(player);
        } else {
            if(this.private_players[room_code] == null) {
                this.private_players[room_code] = new Array();
            }
            this.private_players[room_code].push(player);
            console.log(this.private_players[room_code]);
        }
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

    private_matching(code) {
        if (this.private_players[code].length == 2) {
            return true;
        } 
        return false;
    }
}