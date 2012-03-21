'use strict';

var ActionBase = require('../actionBase');
var IssueTracker = require('../issueTracker');
var open = require('../util/open');

module.exports = ActionBase.extend({
  name: 'edit',
  shortDescription: 'Edit a task',

  cliRun: function (currentPrefs, commander, args, callback) {
    this.populateCommander(commander);
    commander.parse(args);

    if (commander.args.length === 1) {
      var taskId = commander.args[0];
      var tracker = new IssueTracker(commander.directory);
      tracker.getOpenTask(taskId, function (err, task) {
        if (err) {
          callback(err);
          return;
        }
        open(currentPrefs, task.filename, function (err) {
          if (err) {
            callback(err);
            return;
          }

          // reopen to make sure the task isn't broken
          tracker.getOpenTask(taskId, callback);
        });
      });
      return;
    }

    callback(new Error("Invalid number of argument for " + this.name));
  }
});
