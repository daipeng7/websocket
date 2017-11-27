const getHash = require('hash-sum');
const path = require('path');
const fs = require('fs');
const { resHTML } = require('../util');

let Router = (req, res) => {
    const _url = req.url;
    const _extname = path.extname(_url);
    switch(_extname){
        case '.html' : {
            resHTML(_url, req, res);
        }
    }
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