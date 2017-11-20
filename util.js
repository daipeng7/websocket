/**
* 获取数据方法:GET/POST
*/ 
const url = require( 'url' );
const querystring = require( 'querystring' );

// POST
let getPostParams = (req,callback)=>{
    // 编码
   req.setEncoding( 'utf8' );
   // 接收数据
   let requestData = '';
   req.addListener( 'data', (chunk)=>{
       console.log( '我在接收数据' );
       requestData += chunk;
   } );
   // 数据接收完毕
   req.addListener( 'end', ()=>{
       // 转化数据格式，GET/POST
       let params = querystring.parse( requestData );
       if(typeof callback === 'function') callback(params);
   } );
} 

// GET
let getGetParams = (req,callback)=>{
    console.log(req.url);
    let params = url.parse( req.url, true ).query;//第二个参数默认为false，如果为true会调用querystring模块的parse方法解析为一个对象
    if(typeof callback === 'function') callback(params);
}

exports.quest = ( req,callback )=>{
    switch(req.method){
        case 'GET': 
            getGetParams(req,callback);
        break;
        case 'POST':
            getPostParams(req,callback);
        break;
    }
}

