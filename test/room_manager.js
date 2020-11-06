const Room = require('./room.js')
module.exports = class room_manager {
    constructor(io){
        this.rooms = {};
        this.num_rooms = 0;
        this.io = io;
    }

    create_room(id1, id2) {
        let to_add = new Room(id1, id2, this.io);
        to_add.init();
        this.rooms[to_add.id] = to_add;
        this.num_rooms++;
    }

    destroy(room) {
        this.num_rooms--;
        delete this.rooms[room.id];
    }

    update() {
        for(var id in this.rooms) {
            this.rooms[id].update();
        }
    }

    find_room(to_find) {
        let room = {};
        for(var id in this.rooms) {
            if(id.includes(to_find) == true) {
                room = this.rooms[id];
                return room;
            }
        }
    }

    find_user(to_find) {
        let user = {};
        for(var id in this.rooms) {
            if(id.includes(to_find) == true) {
                let room = this.rooms[id];
                user = room.player1.id === to_find ? room.player1 : room.player2;
                return user;
            }
        }
    }

    print_all_rooms() {
        for (var id in this.rooms) {
            this.rooms[id].print_room();
        }
        console.log("num rooms: " + this.num_rooms);
    }
}
