
const crypto = require('crypto');

var get_part = function (key) {
    var empty = '',
        spaces = key.replace(/\S/g, empty).length,
        part = key.replace(/\D/g, empty);
    if (!spaces) throw { message: 'Wrong key: ' + key, name: 'HandshakeError' }
    return get_big_endian(part / spaces);
}

var get_big_endian = function (n) {
    return String.fromCharCode.apply(null, [3, 2, 1, 0].map(function (i) { return n >> 8 * i & 0xff }))
}

var challenge = function (key1, key2, head) {
    var sum = get_part(key1) + get_part(key2) + head.toString('binary');
    return crypto.createHash('md5').update(sum).digest('binary');
}

exports.handSocket = (req, socket, head) => {
    var output = [], h = req.headers, br = '\r\n';

    // header
    output.push(
        'HTTP/1.1 101 WebSocket Protocol Handshake', 'Upgrade: WebSocket', 'Connection: Upgrade',
        'Sec-WebSocket-Origin: ' + h.origin,
        'Sec-WebSocket-Location: ws://' + h.host + req.url,
        'Sec-WebSocket-Protocol: my-custom-chat-protocol' + br
    );
    // body
    var c = challenge(h['sec-websocket-key1'], h['sec-websocket-key2'], head);
    output.push(c);

    socket.write(output.join(br), 'binary');
}