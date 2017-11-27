## websocket ##

### 首先 ###
	长连接：
		一个连接上可以连续发送多个数据包，在连接期间，如果没有数据包发送，需要双方发链路检查包。
	短链接：
		是只通讯双方有数据交互时，就建立一个连接，数据发送完成后，则断开此连接。
	TCP/IP：
		TCP/IP属于传输层，主要解决数据在网络中的传输问题，只管传输数据。但是那样对传输的数据没有一个规范的封装、解析等处理，使得传输的数据就很难识别，所以才有了应用层协议对数据的封装、解析等，如HTTP协议。
	HTTP：
		HTTP是应用层协议，封装解析传输的数据。
		从HTTP1.1开始其实就默认开启了长连接，也就是请求header中看到的Connection:Keep-alive。但是这个长连接只是说保持了（服务器可以告诉客户端保持时间Keep-Alive:timeout=200;max=20;）这个TCP通道，直接Request - Response，而不需要再创建一个连接通道，做到了一个性能优化。但是HTTP通讯本身还是Request - Response。
	socket：
		与HTTP不一样，socket不是协议，它是在程序层面上对传输层协议（可以主要理解为TCP/IP）的接口封装。
		我们知道传输层的协议，是解决数据在网络中传输的，那么socket就是传输通道两端的接口。所以对于前端而言，socket也可以简单的理解为对TCP/IP的抽象协议。
	WebSocket：
		相对于socket，前面加了个web，顾名思义。有浏览器提供的对socket的再次封装。
		能够让客户端和远程服务端通过web建立全双工通信。websocket提供ws和wss两种URL方案。

### WebSocket API ###
使用WebSocket构造函数创建一个WebSocket连接，返回一个websocket实例。通过这个实例我们可以监听事件，这些事件可以知道什么时候简历连接，什么时候有消息被推过来了，什么时候发生错误了，时候连接关闭。我们可以使用node搭建一个WebSocket服务器来看看，[源码](https://github.com/daipeng7/websocket )。同样也可以调用[websocket.org](http://demos.kaazing.com/echo/)网站的demo服务器[http://demos.kaazing.com/echo/](http://demos.kaazing.com/echo/)。

#### 事件 ####

    //创建WebSocket实例，可以使用ws和wss。第二个参数可以选填自定义协议，如果多协议，可以以数组方式
    var socket = new WebSocket('ws://demos.kaazing.com/echo');
- **open**

	服务器相应WebSocket连接请求触发

	    socket.onopen = (event) => {
	    	socket.send('Hello Server!');
	    };

- **message**

	服务器有 响应数据 触发

	    socket.onmessage = (event) => {
	        debugger;
	        console.log(event.data);
	    };

- **error**

    出错时触发，并且会关闭连接。这时可以根据错误信息进行按需处理

	    socket.onerror = (event) => {
			console.log('error');
	    }

- **close**

 
       连接关闭时触发，这在两端都可以关闭。另外如果连接失败也是会触发的。
       针对关闭一般我们会做一些异常处理,关于异常参数：

       1. socket.readyState  
       		2 正在关闭  3 已经关闭
       2. event.wasClean [Boolean]  
       		true  客户端或者服务器端调用close主动关闭
			false 反之
	   3. event.code [Number] 关闭连接的状态码。socket.close(code, reason)
       4. event.reason [String] 
       		关闭连接的原因。socket.close(code, reason)
               
     
		    socket.onclose = (event) => {
		        debugger;
		    }

#### 方法 ####
- **send**

 	send(data) 发送方法
	data 可以是String/Blob/ArrayBuffer/ByteBuffer等

	需要注意,使用send发送数据，必须是连接建立之后。一般会在onopen事件触发后发送：

		socket.onopen = (event) => {
	        socket.send('Hello Server!');
	    };
	如果是需要去响应别的事件再发送消息，也就是将WebSocket实例socket交给别的方法使用，因为在发送时你不一定知道socket是否还连接着，所以可以检查readyState属性的值是否等于OPEN常量，也就是查看socket是否还连接着。

		btn.onclick = function startSocket(){
	        //判断是否连接是否还存在
	        if(socket.readyState == WebSocket.OPEN){
	            var message = document.getElementById("message").value;
	            if(message != "") socket.send(message);
	        }
	    }

- **close**

	使用close([code[,reason]])方法可以关闭连接。code和reason均为选填

		// 正常关闭
		socket.close(1000, "closing normally");

#### 常量 ####


|常量名   		|值  	|描述|
| ----------|:-----:|:----------|
|CONNECTING |	0	|连接还未开启|
|OPEN       |	1	|连接开启可以通信|
|CLOSING    |	2	|连接正在关闭中|
|CLOSED     |	3	|连接已经关闭|

#### 属性 ####

|属性名   | 值类型   |描述|
| ----- |:-----:|:----------|
|binaryType |	String	|表示连接传输的二进制数据类型的字符串。默认为"blob"。|
|bufferedAmount |	Number	|只读。如果使用send()方法发送的数据过大，虽然send()方法会马上执行，但数据并不是马上传输。浏览器会缓存应用流出的数据，你可以使用bufferedAmount属性检查已经进入队列但还未被传输的数据大小。在一定程度上可以避免网络饱和。|
|protocol |	String/Array|在构造函数中，protocol参数让服务端知道客户端使用的WebSocket协议。而在实例socket中就是连接建立前为空，连接建立后为客户端和服务器端确定下来的协议名称。|
|readyState |	String	|只读。连接当前状态，这些状态是与常量相对应的。|
|extensions |	String	|服务器选择的扩展。目前，这只是一个空字符串或通过连接协商的扩展列表。|










