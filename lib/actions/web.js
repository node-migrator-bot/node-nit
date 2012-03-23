'use strict';

var ActionBase = require('../actionBase');
var express = require('express');
var path = require('path');
var IssueTracker = require('../issueTracker');

module.exports = ActionBase.extend({
  name: 'web',
  shortDescription: 'Creates a web server to view and interact with the tasks.',

  populateCommander: function (commander) {
    this._super(commander);
    commander.option('-p, --port <port>', 'sets the port to open the server on. Default: 2323', '2323');
  },

  cliRun: function (tracker, options, callback) {
    if (options.args.length === 0) {
      var app = express.createServer();
      app.options = options;
      app.currentUser = options.user;
      app.tracker = new IssueTracker(options.directory);
      app.set("views", path.join(__dirname, '../web/views'));
      app.set("view engine", "ejs");
      app.configure(function () {
        app.use(express.bodyParser());
        app.use(express.static(path.join(__dirname, '../web/public')));
        app.use(express.errorHandler({dumpExceptions: true, showStack: true}));
      });

      require('../web/routes')(app);

      app.listen(options.port);
      console.log("server started and listening on port " + options.port);
      return;
    }

    callback(new Error("Invalid number of argument for " + this.name));
  }
});
