const crypto = require('crypto');
const cryptoKey = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';

// 计算握手响应accept-key
let challenge = (reqKey) => {
    reqKey += cryptoKey;
    // crypto.vetHashes()可以获得支持的hash算法数组，我这里得到46个
    reqKey = reqKey.replace(/\s/g,"");
    // crypto.createHash('sha1').update(reqKey).digest()得到的是一个Uint8Array的加密数据，需要将其转为base64
    return crypto.createHash('sha1').update(reqKey).digest().toString('base64');
}

exports.handshaking = (req, socket, head) => {
    let _headers = req.headers,
        _key = _headers['sec-websocket-key'],
        resHeaders = [],
        br = "\r\n";
    resHeaders.push(
        'HTTP/1.1 101 WebSocket Protocol Handshake is OK',
        'Upgrade: websocket',
        'Connection: Upgrade',
        'Sec-WebSocket-Origin: ' + _headers.origin,
        'Sec-WebSocket-Location: ws://' + _headers.host + req.url,
    );
    let resAccept = challenge(_key);
    resHeaders.push('Sec-WebSocket-Accept: '+ resAccept + br, head);
    socket.write(resHeaders.join(br), 'binary');
}