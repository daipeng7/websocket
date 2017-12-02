
let parseData = (data) => {
    let data01 = data[0].toString(2), data02 = data[1].toString(2);//第一个字节和第二个字节的二进制字符串
    let fin = data01.slice(0, 1); // 得到fin字符串
    let opcode = parseInt(data01.slice(4), 2); //将opcode的4位二进制字符串转化为十进制
    let dataIndex = 2; // 初始数据下标，因为第一、二个字节肯定不是payload data
    let masked = data02.slice(0, 1); // masked 的值为1或者0
    let payloadLength = parseInt(data02.slice(1), 2); // payloadLength的值按照0-125， 126, 127

    let dataLength, //当前数据的真实长度.因为只有长度为0-125时才为payload length 
        maskingKey; // 如果masked = 1则，表示是客户端发送过来的，需要用使用masking key掩码解析payload data

    if(payloadLength == 126){
        dataIndex += 2;//数据长度为后面2个字节，3、4
        dataLength = data.readUInt16BE(2);
    }else if(payloadLength == 127){
        dataIndex += 8;//数据长度为后面8个字节，3、4、6、7、8、9、10、11
        dataLength = data.readUInt32BE(2) + data.readUInt32BE(6);
    }else{
        dataLength = payloadLength; //如果是0-125
    }

    // 判断是否有masking key
    if(masked === "1") {
        maskingKey = data.slice(dataIndex, dataIndex + 4);
        dataIndex += 4; //重新定位数据位置
    }

    return {
        fin,
        opcode,
        masked,
        dataLength,
        dataIndex
    }

}

let getData = (data) => {
    let state = parseData(data);
    let result;
    if(state.masked === "1"){
        result = Buffer.alloc(state.dataLength - state.dataIndex);
    }

}



exports.bindSocketEvent = (socket) => {
    socket
        .on('data', (buffer) => {
            getData(buffer);
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
