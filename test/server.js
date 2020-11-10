const express      = require('express');
const app          = express();
const http         = require('http').createServer(app);
const io           = require('socket.io')(http);
const Lobby        = require('./lobby.js')
const RoomManager  = require('./room_manager.js')


let lobby        = new Lobby();
let room_manager = new RoomManager(io);

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/lobby.html');
});

app.get('/client', (req, res) => {
    res.sendFile(__dirname + '/client.html');
});

io.on('connection', (socket) => {
    //io.emit('config', config);
    //io.emit('text_update', "Waiting for other player...");

    lobby.add_player(socket.id);
    console.log("----------------------------------")
    console.log(lobby.players);
    console.log("\nnum players:", lobby.get_num_player());
    console.log("----------------------------------")

    if(lobby.get_num_player() % 2 == 0) {
        let player1 = lobby.players.shift();
        let player2 = lobby.players.shift();
        room_manager.create_room(player1, player2);
        room_manager.print_all_rooms();
    }

    socket.on('disconnect', () => {
        curr_state = "ST_IDLE";
        let room = room_manager.find_room(socket.id);
        room_manager.destroy(room);
    });

    socket.on('keydown', (keycode) => {
        if (room_manager.num_rooms > 0) {
            let user = room_manager.find_user(socket.id);
            if(user != null) {
                room_manager.find_user(socket.id).keypress[keycode] = true;
            }
        }
    });

    socket.on('keyup', (keycode) => {
        if (room_manager.num_rooms > 0) {
            let user = room_manager.find_user(socket.id);
            if(user != null) {
                room_manager.find_user(socket.id).keypress[keycode] = false;
            }
        }
    });

});

const UP = 38, DOWN = 40, SPACE = 32;
var update = setInterval(() => {
    if(room_manager.num_rooms > 0) {
        room_manager.update();
    }
}, 30);

const port = 3000;
http.listen(port, () => {
    console.log("listening on port " + port);
});