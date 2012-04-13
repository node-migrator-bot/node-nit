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

  cliRun: function (tracker, options, callback) {
    if (options.args.length === 1) {
      var taskId = options.args[0];
      this.findOpenTask(tracker, taskId, function (err, task) {
        if (err) {
          callback(err);
          return;
        }

        if (task.isAssignedTo(options.user)) {
          callback(new Error("Task already assigned to you."));
          return;
        }

        if (task.isAssigned() && !options.force) {
          callback(new Error(sf("Task is already assigned to {0}. Use the --force option to override.", task.fields['Assigned To'])));
          return;
        }

        tracker.assign(task.id, options.user, options.user, function (err, task) {
          if (err) {
            return callback(err);
          }
          console.log(sf('Task {id} assigned to {1}', task, options.user));
          callback(null, task);
        });
      });
      return;
    }

    callback(new Error("Invalid number of argument for " + this.name));
  }
});
