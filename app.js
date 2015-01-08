var express = require('express');
var app  = express();
var http = require('http').Server(app);
var io   = require('socket.io')(http);
var fs   = require('fs');
var bp   = require('body-parser');
var path = require('path');
var mp   = require('multiparty');
var routes = require('./routes');
var connect = require('./lib/connect.js');

app.use(express.static(__dirname + '/public'));
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(bp.urlencoded({extended: false}));
app.use(bp.json());

app.get('/', routes.get);

app.post('/', routes.post);

io.on('connection', connect.on);

http.listen(3000, function() {
    console.log('listening on *:3000');
});
