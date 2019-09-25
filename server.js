var path = require('path');
var express = require('express'),
  app = express(),
  port = process.env.PORT || 3200;
  Task = require('./api/models/apiModel'),
  bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var routes = require('./api/routes/apiRoutes');
routes(app);
app.use('/checkpoints', express.static(path.join(__dirname, 'api/checkpoints')));

app.listen(port);

console.log('BitsOfBeats API server started on: ' + port);