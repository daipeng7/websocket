
const Handler = require("./handler");
const socketList = [];


exports.bindSocketEvent = (socket) => {
    let websocket = new Handler(socket);
    websocket.sendCheckPing();
    socket
        .on('data', (buffer) => {
            websocket.getData(buffer, (s, data) => {
                let sendMsg = "server recieved message :" + data;
                websocket.writeData(websocket.createData(sendMsg));
            });
        })
        .on('close', () => {
            console.log('socket close');
        })
        .on('end', () => {
            console.log('socket end');
        });
};
