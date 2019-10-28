const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const indexRouter = require('./routes/index');

const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

io.on('connection',function(sock){
	console.log("/ connected");
});
const game = io.of('/game');
game.on('connection',function(sock){
	let name = sock.handshake.query.username;
	console.log("/game connected",name,sock.client.id);

	sock.on('input',function(data){
		game.emit('input',data);
	});
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next){
	res.io = io;
	next();
});

app.use('/', indexRouter)

module.exports = {app: app, server: server};
