'use strict';

var ActionBase = require('../actionBase');
var IssueTracker = require('../issueTracker');

module.exports = ActionBase.extend({
  name: 'comment',
  shortDescription: 'Add a comment to a task.',

  cliUsageArgumentsString: function () {
    return "<taskid> <comment>" + this._super();
  },

  cliRun: function (currentPrefs, commander, tracker, callback) {
    if (commander.args.length === 2) {
      var taskId = commander.args[0];
      var comment = commander.args[1];
      tracker.addComment(taskId, currentPrefs.user, comment, callback);
      return;
    }

    callback(new Error("Invalid number of argument for " + this.name));
  }
});
