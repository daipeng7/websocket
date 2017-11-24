
const http = require('http');
const fs = require('fs');
const { quest } = require('./util');
const Router = require('./route');
let appServer = http.createServer();

appServer.on('request', (req, res) => {
    console.log('请求头:', req.headers);
    console.log('http版本:', req.httpVersion);
    console.log('请求方法:', req.method);
    Router(req, res);
    fs.readFile('./pages/index.html', 'utf-8',(error, file) => {
        res.writeHead(200,{
            'Content-Type' : 'text/html;charset=utf-8'
        });
        res.end(file, 'utf-8', () => {
            console.log('页面发送成功！');
        });
    });
});

appServer.listen(8083, () => {
    console.log('http server is running!');
});