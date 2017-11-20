/**
 * net.Server和net.createServer的两个构造函数
 */ 
const net = require('net');
let server = net.createServer();
server.on('connection', (socket) => {
    socket.on('data', () => {

    }).on('end', () => {

    }).on('error', () => {
        
    }).on('timeout', () => {
        
    })
});
server.listen(8081, () => {
    console.log('sever runnint!')
});