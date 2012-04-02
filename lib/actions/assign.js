'use strict';

var ActionBase = require('../actionBase');
var IssueTracker = require('../issueTracker');
var sf = require('sf');
var cliUtils = require('../util/cli');

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
    if (options.args.length === 1 || options.args.length === 2) {
      var taskId = options.args[0];
      var userName = options.args[1] || '';
      tracker.resolveUserName(userName, function (err, resolvedUserNames) {
        if (err) {
          return callback(err);
        }

        if (resolvedUserNames.length === 0) {
          return callback(new Error("Could not resolve username."));
        }
        tracker.getOpenTask(taskId, function (err, task) {
          if (err) {
            return callback(err);
          }
          if (task.isAssigned() && !options.force) {
            return callback(new Error(sf('Task is already assigned to "{0}". Use the --force option to override.', task.fields['Assigned To'])));
          }

          cliUtils.selectOption(resolvedUserNames, 'Multiple users found, select one:', function (err, selectedOption) {
            if (err) {
              return callback(err);
            }
            userName = selectedOption;

            if (task.isAssignedTo(userName)) {
              return callback(new Error('Task already assigned to "' + userName + '".'));
            }

            tracker.assign(taskId, userName, options.user, function (err, task) {
              if (err) {
                return callback(err);
              }
              console.log(sf('Task {id} assigned to {1}', task, userName));
              callback(null, task);
            });
          });
        });
      });
      return;
    }

    callback(new Error("Invalid number of argument for " + this.name));
  }
});
