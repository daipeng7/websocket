/**
 * net.Server和net.createServer的两个构造函数
 */ 
const hash = require('hash-sum');
const http = require('http');
const route = require('../route');
const { handSocket } = require('./handSocket');
const { bindSocketEvent } = require('./bindSocket');

let clientList = {};
let server = http.createServer();

// 如果客户端发送CONNECT请求时触发。
server.on('connect', (req, socket, head) => {
    
});

// 当一个TCP流建立时,也就是一个TCP连接建立，触发。request.connection也可以访问.
server.on('connection', (socket) => {
    console.log('connection事件:', socket);
});

// 每次请求都会触发，三次握手的第三次触发
server.on('request', (req, res) => {
    console.log(req.url);
    //不是WebSocket升级请求，转为文件请求
    if(!req.upgrade) {
        route(req, res);
    }
});

// 当客户端发生HTTP upgrade请求是触发。如果
server.on('upgrade', (req, socket, head) =>{
    // 检查是否为非法链接
    if(req.headers.upgrade != 'websocket'){
        console.log('非法连接，不是WebSocket连接');
        socket.end();
    }
    
    // 绑定socket服务端事件
    bindSocketEvent(socket);

    //握手发送握手信息
    try{
        handSocket(req, socket, head);
    }catch(error){
        console.log(error);
        socket.end();
    }
});

// close
server.on('close', () => {

});

server.listen(8081, () => {
    console.log('sever running!')
});