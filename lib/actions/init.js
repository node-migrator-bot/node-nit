'use strict';

var ActionBase = require('../actionBase');
var path = require('path');
var issueTracker = require('../issueTracker');

module.exports = ActionBase.extend({
  name: 'init',
  shortDescription: 'Initializes a directory for issue tracking',

  cliRun: function (commander, args, callback) {
    this.populateCommander(commander);
    commander.parse(args);

    if (commander.args.length === 0) {
      issueTracker.init(commander.directory, callback);
      return;
    }

    callback(new Error("Invalid number of arguments for " + this.name));
  }
});
