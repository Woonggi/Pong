const express      = require('express');
const app          = express();
const http         = require('http').createServer(app);
const io           = require('socket.io')(http);
const Lobby        = require('./lobby.js')
const RoomManager  = require('./room_manager.js')
const token_builder = require('./token.js')

app.use(express.static('/images'))
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/menu.html');
});

let username = "default";
let room_code = "";
app.get('/public/:username/', (req, res) => {
    res.sendFile(__dirname + '/game.html');
    console.log("GET PUBLIC")
    username = req.params.username;
    room_code = "public";
});

let room_codes = {}; 
app.get('/private/:room_code/:username', (req, res) => {
    res.sendFile(__dirname + '/game.html');
    console.log("GET PRIVATE")
    username = req.params.username;
    room_code = req.params.room_code;
});

let mode = "public"
var menu_io = io.of('/menu')
menu_io.on('connection', async(socket) => {
    console.log(socket.id + " joined menu");
    // here, the server validate user's login
    let validate = 0;
    let message = "";
    let login = new Promise((resolve, reject) => {
        socket.on('join_public', (username) => {
            message = "public";
            validate = 1;
            socket.emit('public_validation', validate, message);
        });

        // create private
        socket.on('create_private', (username, room_code) => {
            if(room_codes[room_code] >= 1) {
                message = room_code + " already exists!";
                reject(message);
            } else {
                room_codes[room_code] = 1;
                validate = 1;
            }
            console.log('EMIT!');
            socket.emit('create_validation', validate, message)
        });
        // join private
        socket.on('join_private', (username, room_code) => {
            let validate = 0; 
            let message = "";
            if (room_codes[room_code] == null) {
                message = room_code + " does not exist!";
                reject(message);
            }
            else if (room_codes[room_code] == 1) {
                room_codes[room_code]++;
                validate = 1;
            } else if (room_codes[room_code] > 1) {
                message = "Room is full!";
                reject(message);
            }
            socket.emit('join_validation', validate, message);
        })
        resolve(message);
    });

    mode = await login;
});

var game_io = io.of('/game')
let lobby = new Lobby();
let room_manager = new RoomManager(game_io);
game_io.on('connection', (socket) => {
    console.log(socket.id + " joined game");
    lobby.add_player(socket.id, username, room_code);
    console.log(lobby.players);

    if(lobby.get_num_player() % 2 == 0 && lobby.get_num_player() > 0) {
        let player1 = lobby.players.shift();
        let player2 = lobby.players.shift();
        room_manager.create_room(player1, player2);
        //room_manager.print_all_rooms();
    }
    if(lobby.get_num_private_players(room_code) == 2) {
        let player1 = lobby.private_players[room_code].shift();
        let player2 = lobby.private_players[room_code].shift();
        room_manager.create_room(player1, player2);
    }

    socket.on('disconnect', () => {
        const room = room_manager.find_room(socket.id);
        if(room != null) {
            room.disconnect(socket.id);
        }
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
})

var update = setInterval(() => {
    room_manager.update();
}, 30);

const port = 3000;
http.listen(port, () => {
    console.log("listening on port " + port);
});