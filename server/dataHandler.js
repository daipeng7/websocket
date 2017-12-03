
module.exports =  class DataHandler {
    constructor(socket){
        this.socket = socket;
        this.state = {
            index : 0  // 同一份数据不同帧的序列号
        };
        this.dataList = [];
    }

    init() {

    }

    // 解析当前帧状态
    getState(data) {
        let data01 = data[0].toString(2), data02 = data[1].toString(2);//第一个字节和第二个字节的二进制字符串
        let fin = data01.slice(0, 1); // 得到fin字符串
        let opcode = parseInt(data01.slice(4), 2); //将opcode的4位二进制字符串转化为十进制
        let dataIndex = 2; // 初始数据下标，因为第一、二个字节肯定不是payload data
        let masked = data02.slice(0, 1); // masked 的值为1或者0
        let payloadLength = parseInt(data02.slice(1), 2); // payloadLength的值按照0-125， 126, 127
    
        let dataLength, //当前帧数据的真实长度.因为只有长度为0-125时才为payload length 
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

        // 第一帧
        if(this.state.index == 0){
            this.state.length = dataLength;
        }
        Object.assign(this.state, {
            fin,
            opcode,
            masked,
            totalLength : dataLength,
            dataIndex,
            maskingKey
        });
    }

    // 解析并组数据
    getData(data, callback) {
        this.getState(data);
        let result; // 当前帧的数据
        if(this.state.masked === "1"){
            result = Buffer.alloc(data.length - this.state.dataIndex); // 开辟一个缓存，默认是使用的0填充
            for(let i = this.state.dataIndex, j = 0; i < data.length; i++, j++){
                result[j] = data[i] ^ this.state.maskingKey[ j % 4 ];  // 异或运算，使用maskingKey四个字节轮流进行计算
            }
        }else{
            result = data.slice(this.state.dataIndex, data.length);
        }
        
        this.dataList.push(result);

        this.state.length -= (data.length - this.state.dataIndex);

        // 长度为0，说明当前帧位最后一帧。不要使用fin因为有可能是分块后分片传送
        if(this.state.length == 0){
            let buf = Buffer.concat(this.dataList, this.state.totalLength);
            callback(buf);
            this.resetState();
            this.state.index = 0;
        }else{
            this.state.index++;
        }
    }

    // 重置状态，当一份数据发送完成后重置
    resetState() {
        this.dataList = [];
        this.state.index = 0;
    }
    
}

module.exports 