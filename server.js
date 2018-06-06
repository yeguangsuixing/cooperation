

var express = require('express');
var app = express();

const server = require('http').Server(app);  
const io = require('socket.io')(server);  

app.use(express.static('./public'));  
server.listen(3000, '0.0.0.0');

let groups = [];

io.on('connection', (socket) => {  
	console.log("connected " + socket.id);
	let group = null;
	console.log("groups.length = " + groups.length);
	for(let i = 0; i < groups.length; i ++){
		let g = groups[i];
		if(g.socketIds.length < 2){
			group = g;
			break;
		}
	}
	if(!group){
		group = {
			createdAt:new Date(),
			name:'group-' + +new Date(),//todo 
			socketIds:[],
			count:{}
		};
		groups.push(group);
		console.log('created a new group, named ' + group.name);
	}
	group.socketIds.push(socket.id);
	group.count[socket.id] = 0;
	socket.join(group.name);
	if(group.socketIds.length === 2){
		group.startsAt = new Date();
		group.socketIds.forEach(function(id){
			group.count[id] = 0;
		});
		io.sockets.in(group.name).emit('action', {
			type:'start'
		});
		io.sockets.in(group.name).emit('receiveMessage', {
			count:group.count
		});
	}

	socket.on('sendMessage', () => {  
		++group.count[socket.id];
		io.sockets.in(group.name).emit('receiveMessage', {
			count:group.count
		});
	});


	socket.on('disconnect', function() {
	    console.log("disconnect");
	});


	socket.on('reconnect', function() {
	    console.log("reconnect");
	});

	socket.on('rooms', () => {
		socket.emit('rooms', {
			rooms:io.sockets.manager.rooms
		});
	});
}); 
