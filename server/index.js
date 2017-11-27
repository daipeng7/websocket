/**
 * net.Server和net.createServer的两个构造函数
 */ 
const hash = require('hash-sum');
const http = require('http');
const route = require('../route');

let clientList = {};
let server = http.createServer();

// 如果客户端发送CONNECT请求时触发
server.on('connect', (req, socket, head) => {
    socket.on('data', (data) => {
        
    });
});

// 当一个TCP流建立时,也就是一个TCP连接建立，触发。request.connection也可以访问.三次握手的前两次出发
server.on('connection', (socket) => {
    
});

// 每次请求都会触发，三次握手的第三次触发
server.on('request', (req, res) => {
    route(req, res);
});

// 当客户端发生HTTP upgrade请求是触发。如果
server.on('upgrade', (req, socket, head) =>{
    socket.on('data', (data) => {

    });
});

// close
server.on('close', () => {

});

server.listen(8081, () => {
    console.log('sever running!')
});