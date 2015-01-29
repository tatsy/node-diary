var express = require('express');
var app  = express();
var http = require('http').Server(app);
var io   = require('socket.io')(http);
var fs   = require('fs');
var path = require('path');
var mp   = require('multiparty');
var routes = require('./routes');
var connect = require('./lib/connect.js');

var configFile = './config.json';
if(!fs.existsSync(configFile)) {
    console.log('config.json does not exists. use template file.');
    configFile = './config.template.json';
}
var config  = JSON.parse(fs.readFileSync(configFile).toString());

app.use('/', express.static(__dirname + '/public'));
app.use('/highlight', express.static(__dirname + '/node_modules/highlight.js'));

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.set('config', config);

app.get('/', routes.index);
app.post('/edit', routes.edit);

io.of('/edit').on('connection', connect.on);

http.listen(config.port, config.host, function() {
    console.log('listening on ' + config.host + ':' + config.port.toString());
});

module.exports = app;
