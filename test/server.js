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

let username = "";
let room_code = "public";
app.get('/public/:username/', (req, res) => {
    res.sendFile(__dirname + '/game.html');
    username = req.params.username;
    room_code = "public";
});

let room_codes = []; 
app.get('/private/:room_code/:username', (req, res) => {
    res.sendFile(__dirname + '/game.html')
    username = req.params.username;
    room_code = req.params.room_code;
});

io.on('connection', (socket) => {
    lobby.add_player(socket.id, username, room_code);
    username = "";

    console.log("----------------------------------")
    console.log(lobby.players);
    console.log("\nnum players:", lobby.get_num_player());
    console.log("----------------------------------")

    if(lobby.private_matching(room_code) == true) {
        let player1 = lobby.private_players[room_code].shift();
        let player2 = lobby.private_players[room_code].shift();
        room_manager.create_room(player1, player2);
    } 
    else if(lobby.get_num_player() % 2 == 0 && room_code === "public") {
        let player1 = lobby.players.shift();
        let player2 = lobby.players.shift();
        room_manager.create_room(player1, player2);
        room_manager.print_all_rooms();
    }

    socket.on('disconnect', () => {
        // error: if there's only one user, crashes here since there's no room atm.
        const room = room_manager.find_room(socket.id);
        room.disconnect(socket.id);
    });

    socket.on('keydown', (keycode) => {
        if (room_manager.num_rooms > 0) {
            let user = room_manager.find_user(socket.id);
            if (user != null) {
                room_manager.find_user(socket.id).keypress[keycode] = true;
            }
        }
    });

    socket.on('keyup', (keycode) => {
        if (room_manager.num_rooms > 0) {
            let user = room_manager.find_user(socket.id);
            if (user != null) {
                room_manager.find_user(socket.id).keypress[keycode] = false;
            }
        }
    });
});


var update = setInterval(() => {
    if(room_manager.num_rooms > 0) {
        room_manager.update();
    }
}, 30);

const port = 3000;
http.listen(port, () => {
    console.log("listening on port " + port);
});