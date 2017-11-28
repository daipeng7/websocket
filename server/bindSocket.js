// 包装将要发送的帧
var wrap = function (data) {
    var fa = 0x00, fe = 0xff, data = data.toString()
    len = 2 + Buffer.byteLength(data),
        buff = new Buffer(len);

    buff[0] = fa;
    buff.write(data, 1);
    buff[len - 1] = fe;
    return buff;
}
// 解开接收到的帧
var unwrap = function (data) {
    return data.slice(1, data.length - 1);
}

exports.bindSocketEvent = function (socket) {
    socket
        .on('data', function (buffer) {
            var data = unwrap(buffer);
            console.log('socket receive data : ', buffer, data, '\n>>> ' + data);
            // send('hello html5,'+Date.now())
            socket.emit('send', data);
        })
        .on('close', function () {
            console.log('socket close');
        })
        .on('end', function () {
            console.log('socket end');
        })
        .on('send', function (data) { //自定义事件
            socket.write(wrap(data), 'binary');
        })
};
