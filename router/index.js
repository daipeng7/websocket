const getHash = require('hash-sum');

let Router = (socket) => {
    
}
let getList = {};
let postList = {};

Router.get = (url,callback) => {
    getList[ getHash(url) ] = callback;
}

Router.post = (url,callback) => {
    postList[ getHash(url) ] = callback;
}

module.exports = Router;