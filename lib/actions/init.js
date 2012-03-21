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

  cliRun: function (currentPrefs, commander, tracker, callback) {
    if (commander.args.length === 0) {
      IssueTracker.create(commander.directory, {
        taskPrefix: commander.taskprefix
      }, callback);
      return;
    }

    callback(new Error("Invalid number of arguments for " + this.name));
  }
});
