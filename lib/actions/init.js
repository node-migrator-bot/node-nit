'use strict';

var ActionBase = require('../actionBase');
var IssueTracker = require('../issueTracker');

module.exports = ActionBase.extend({
  name: 'init',
  shortDescription: 'Initializes a directory for issue tracking',

  populateCommander: function (commander) {
    this._super(commander);
    commander.option('-tp, --taskprefix <prefix>', 'Prefix for tasks files (ie PRJ-52.task). Default: PRJ-', 'PRJ-');
  },

  cliRun: function (commander, args, callback) {
    this.populateCommander(commander);
    commander.parse(args);

    if (commander.args.length === 0) {
      IssueTracker.create(commander.directory, {
        taskPrefix: commander.prefix
      }, callback);
      return;
    }

    callback(new Error("Invalid number of arguments for " + this.name));
  }
});
