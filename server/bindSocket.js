const DataHandler = require("./dataHandler");
const socketList = [];


exports.bindSocketEvent = (socket) => {
    let websocket = new DataHandler(socket);
    socket
        .on('data', (buffer) => {
            websocket.getData(buffer, (s, data) => {
                let sendMsg = `server recieved message : ${data}`
                let sendBuf = websocket.createData(sendMsg);
                s.write(sendBuf);
            });
        })
        .on('close', () => {
            console.log('socket close');
        })
        .on('end', () => {
            console.log('socket end');
        })
        .on('send', (data) => { //自定义事件
           
        })
};
