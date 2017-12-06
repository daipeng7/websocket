module.exports =  class Handler {
    constructor(socket){
        this.socket = socket;
        this.state = {
            index : 0  // 同一份数据不同帧的序列号
        };
        this.dataList = [];
        this.pingTimes = 0;
        this.OPEN = true;
    }

    // 解析当前帧状态
    getState(data) {
        let data01 = data[0].toString(2), data02 = data[1].toString(2);//第一个字节和第二个字节的二进制字符串
        let fin = data01.slice(0, 1); // 得到fin字符串
        let opcode = parseInt(data01.slice(4), 2); //将opcode的4位二进制字符串转化为十进制
        let dataIndex = 2; // 初始数据下标，因为第一、二个字节肯定不是payload data
        let masked = data02.slice(0, 1); // masked 的值为1或者0
        let payloadLength = parseInt(data02.slice(1), 2); // payloadLength的值按照0-125， 126, 127分别取值
        let payloadData;
        let maskingKey; // 如果masked = 1则，表示是客户端发送过来的，需要用使用masking key掩码解析payload data
        
        
        if(payloadLength == 126){
            dataIndex += 2;//数据长度为后面2个字节，3、4
            payloadLength = data.readUInt16BE(2);// 使用Nodejs Buffer 方法。从3个字节开始左往右读16位（也就是两个字节3、4）.也可以使用data.readUIntBE(2, 2)
        }else if(payloadLength == 127){
            dataIndex += 8;//数据长度为后面8个字节，3、4、6、7、8、9、10、11
            payloadLength = data.readUInt32BE(2) + data.readUInt32BE(6); //先读取的3、4、6、7，然后读取的8、9、10、11。也可以使用data.readUIntBE(2,6)+data.readUIntBE(8,2)
        }
    
        // 判断是否有masking key
        if(masked === "1") {
            maskingKey = data.slice(dataIndex, dataIndex + 4);
            dataIndex += 4; //重新定位数据位置
            payloadData = data.slice(dataIndex);
        }
        let remains = this.state.remains || payloadLength; // 剩余数据长度
        remains = remains - payloadData.length; //还剩余多少长度的payload data
        
        Object.assign(this.state, {
            fin,
            opcode,
            masked,
            dataIndex,
            maskingKey,
            payloadData,
            payloadLength,
            remains
        });
    }

    // 收集本次message的所有数据
    getData(data, callback) {
        this.getState(data);
        // 如果状态码为8说明要关闭连接
        if(this.state.opcode == 8) {
            this.OPEN = false;
            this.closeSocket();
            return;
        }
        // 如果是心跳pong,回一个ping
        if(this.state.opcode == 10) {
            this.OPEN = true;
            this.pingTimes = 0;// 回了pong就将次数清零
            return;
        }
        // 收集本次数据流数据
        this.dataList.push(this.state.payloadData);

        // 长度为0，说明当前帧位最后一帧。
        if(this.state.remains == 0){
            let buf = Buffer.concat(this.dataList, this.state.payloadLength);
            //使用掩码maskingKey解析所有数据
            let result = this.parseData(buf);
            // 数据接收完成后回调回业务函数
            callback(this.socket, result);
            //重置状态，表示当前message已经解析完成了
            this.resetState();
        }else{
            this.state.index++;
        }
    }

    // 解析本次message所有数据
    parseData(allData, callback){
        let len = allData.length,
            i = 0;
        for(; i < len; i++){
            allData[i] = allData[i] ^ this.state.maskingKey[ i % 4 ];// 异或运算，使用maskingKey四个字节轮流进行计算
        }
        // 判断数据类型，如果为文本类型
        if(this.state.opcode == 1) allData = allData.toString();

        return allData;
    }

    // 组装数据帧
    createData(data){
        let dataType = Buffer.isBuffer(data);// 数据类型
        let dataBuf, // 需要发送的二进制数据
            dataLength,// 数据真实长度
            dataIndex = 2; // 数据的起始长度
        let frame; // 数据帧

        if(dataType) dataBuf = data;
        else dataBuf = Buffer.from(data); // 也可以不做类型判断，直接Buffer.form(data)
        dataLength = dataBuf.byteLength; 
        
        // 计算payload data在frame中的起始位置
        dataIndex = dataIndex + (dataLength > 65535 ? 8 : (dataLength > 125 ? 2 : 0));

        frame = new Buffer.alloc(dataIndex + dataLength);

        //第一个字节,fin = 1,opcode = 1
        frame[0] = parseInt(10000001, 2);

        //长度超过65535的则由8个字节表示，因为4个字节能表达的长度为4294967295，已经完全够用，因此直接将前面4个字节置0
        if(dataLength > 65535){
            frame[1] = 127; //第二个字节
            frame.writeUInt32BE(0, 2); 
            frame.writeUInt32BE(dataLength, 6);
        }else if(dataLength > 125){
            frame[1] = 126;
            frame.writeUInt16BE(dataLength, 2);
        }else{
            frame[1] = dataLength;
        }

        // 服务端发送到客户端的数据
        frame.write(dataBuf.toString(), dataIndex);

        return frame;
    }

    // 心跳检查
    sendCheckPing(){
        let _this = this;
        let timer = setTimeout(() => {
            clearTimeout(timer);
            if (_this.pingTimes >= 3) {
                _this.closeSocket();
                return;
            }
            this.sendPing();
            //记录心跳次数
            _this.pingTimes++;
            _this.sendCheckPing();
        }, 5000);
    }
    // 发送心跳ping
    sendPing() {
        let ping = Buffer.alloc(2);
        ping[0] = parseInt(10001001, 2);
        ping[1] = 0;
        this.writeData(ping);
    }
    //关闭连接
    closeSocket(){
        this.socket.end();
    }
    // 在连接中write数据
    writeData(data){
        if(this.OPEN){
            this.socket.write(data);
        }
    }
    // 重置状态，当一份数据发送完成后重置
    resetState() {
        this.dataList = [];
        this.state.index = 0;
    }
    
}

module.exports 