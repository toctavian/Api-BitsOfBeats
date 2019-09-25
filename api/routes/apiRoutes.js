'use strict';
module.exports = function(app) {
  var apiController = require('../controllers/apiController');

  // todoList Routes
  app.route('/get-pattern')
    .post(apiController.getPattern);
};