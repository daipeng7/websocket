/**
 * net.Server和net.createServer的两个构造函数
 */ 
const hash = require('hash-sum');
const net = require('net');
const route = require('../route');

let clientList = {};
let server = net.createServer();
server.on('connection', (socket) => {
    route(socket);
    socket.on('data', (buffer) => {
        buffer.toString()
    }).on('end', () => {

    }).on('error', () => {
        
    }).on('timeout', () => {
        
    })
});
server.listen(8081, () => {
    console.log('sever running!')
});