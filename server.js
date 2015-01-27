var express = require('express');
var app  = express();
var http = require('http').Server(app);
var io   = require('socket.io')(http);
var fs   = require('fs');
var path = require('path');
var mp   = require('multiparty');
var routes = require('./routes');
var connect = require('./lib/connect.js');

app.use('/', express.static(__dirname + '/public'));
app.use('/highlight', express.static(__dirname + '/node_modules/highlight.js'));

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

app.get('/', routes.index);
app.post('/edit', routes.edit);

io.of('/edit').on('connection', connect.on);

module.exports = http;
