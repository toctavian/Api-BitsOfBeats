var path = require('path');
var express = require('express'),
  server = express(),
  port = process.env.PORT || 3200;
  Task = require('./api/models/apiModel'),
  bodyParser = require('body-parser');

server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());

var routes = require('./api/routes/apiRoutes');
routes(server);
server.use('/checkpoints', express.static(path.join(__dirname, 'api/checkpoints')));

server.listen(port);

module.exports = server;

console.log('BitsOfBeats API server started on: ' + port);