const DataHandler = require("./dataHandler");



exports.bindSocketEvent = (socket) => {
    let dataHandler = new DataHandler(socket);
    socket
        .on('data', (buffer) => {
            dataHandler.getData(buffer, (data) => {
                console.log(data.toString());
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
