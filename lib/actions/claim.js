'use strict';

var ActionBase = require('../actionBase');
var IssueTracker = require('../issueTracker');
var sf = require('sf');

module.exports = ActionBase.extend({
  name: 'claim',
  shortDescription: 'Assign a task to yourself.',

  cliUsageArgumentsString: function () {
    return "<taskid> " + this._super();
  },

  populateCommander: function (commander) {
    this._super(commander);
    commander.option('--force', 'Force the assignment to me.');
  },

  cliRun: function (currentPrefs, commander, tracker, callback) {
    if (commander.args.length === 1) {
      var taskId = commander.args[0];
      tracker.getOpenTask(taskId, function (err, task) {
        if (err) {
          callback(err);
          return;
        }

        if (task.isAssignedTo(currentPrefs.user)) {
          callback(new Error("Task already assigned to you."));
          return;
        }

        if (task.isAssigned() && !commander.force) {
          callback(new Error(sf("Task is already assigned to {0}. Use the --force option to override.", task.fields['Assigned To'])));
          return;
        }

        tracker.assign(taskId, currentPrefs.user, currentPrefs.user, callback);
      });
      return;
    }

    callback(new Error("Invalid number of argument for " + this.name));
  }
});
