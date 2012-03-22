'use strict';

var ActionBase = require('../actionBase');
var IssueTracker = require('../issueTracker');

module.exports = ActionBase.extend({
  name: 'init',
  shortDescription: 'Initializes a directory for nit',
  requiresInit: false,

  populateCommander: function (commander) {
    this._super(commander);
    commander.option('-p, --taskprefix <prefix>', 'Prefix for tasks files (ie PRJ-52.task). Default: PRJ-', 'PRJ-');
  },

  cliRun: function (tracker, options, callback) {
    if (options.args.length === 0) {
      IssueTracker.create(options.directory, {
        taskPrefix: options.taskprefix
      }, callback);
      return;
    }

    callback(new Error("Invalid number of arguments for " + this.name));
  }
});
