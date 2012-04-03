'use strict';

var ActionBase = require('../actionBase');
var IssueTracker = require('../issueTracker');
var sf = require('sf');

module.exports = ActionBase.extend({
  name: 'assign',
  shortDescription: 'Assign a task to a person.',

  cliUsageArgumentsString: function () {
    return "<taskid> <user>" + this._super();
  },

  populateCommander: function (commander) {
    this._super(commander);
    commander.option('--force', 'Force the assignment to me.');
  },

  cliRun: function (tracker, options, callback) {
    var self = this;

    if (options.args.length === 1 || options.args.length === 2) {
      var taskId = options.args[0];
      var userName = options.args[1] || '';
      this.findUser(tracker, userName, function (err, resolvedUserNames) {
        if (err) {
          return callback(err);
        }
        userName = resolvedUserNames;

        self.findOpenTask(tracker, taskId, function (err, task) {
          if (err) {
            return callback(err);
          }
          if (task.isAssigned() && !options.force) {
            return callback(new Error(sf('Task is already assigned to "{0}". Use the --force option to override.', task.fields['Assigned To'])));
          }
          if (task.isAssignedTo(userName)) {
            return callback(new Error('Task already assigned to "' + userName + '".'));
          }

          tracker.assign(task.id, options.user, userName, function (err, task) {
            if (err) {
              return callback(err);
            }
            console.log(sf('Task {id} assigned to {1}', task, userName));
            callback(null, task);
          });
        });
      });
      return;
    }

    callback(new Error("Invalid number of argument for " + this.name));
  }
});
