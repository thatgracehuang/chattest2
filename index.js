var express = require('express');
var app = express();
var path = require("path");
var server = require ("http").createServer(app);
var io = require('socket.io')(server);
//var io = require("../..")(server);
var port = process.env.PORT || 3000;
//var http = require('http').Server(app);

server.listen(port, () => {
	console.log('listening at port %d', port);
});

//Routing
app.use(express.static(path.join(__dirname, 'public')));
// app.get('/', function(req, res){
// 	res.sendFile(__dirname + '/index.html');
// });


//Chatroom

var numUsers = 0;


io.on('connection', (socket) => {

	var addedUser = false;

	socket.on('new message', (data) => {

		socket.broadcast.emit('new message', {
			username: socket.username, 
			message: data
		});
	});

	socket.on("add user", (username) => {
		if (addedUser) return;

		socket.username = username;
		++numUsers;
		addedUser = true;
		socket.emit('login', {
			numUsers: numUsers
		});
		socket.broadcast.emit('user joined', {
			username: socket.username,
			numUsers: numUsers
		});

	});

	socket.on('typing', () => {
			socket.broadcast.emit('typing', {
			username: socket.username
		});
	});

	socket.on('stop typing', () => {
		socket.broadcast.emit('stop typing', {
			username: socket.username
		});
	});

	socket.on('disconnect', () => {
		if (addedUser){
			--numUsers;
			socket.broadcast.emit('user left', {
				username: socket.username,
				numUsers: numUsers
			});
		}
	});
	// socket.on('chat message', function(msg) {
	// //	console.log('message: ' + msg);
	// 	io.emit('chat message', msg);
	// });

	//console.log('a user has connected');
	//socket.on('disconnect', function(){
	//	console.log("user disconnected");
	//});
});



// http.listen(3000, function(){
// 	console.log('listening on *:3000');
// });