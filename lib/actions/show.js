'use strict';

var ActionBase = require('../actionBase');
var IssueTracker = require('../issueTracker');

module.exports = ActionBase.extend({
  name: 'show',
  shortDescription: 'Shows the specified task',

  cliUsageArgumentsString: function () {
    return "<taskid> " + this._super();
  },

  cliRun: function (currentPrefs, commander, args, callback) {
    this.populateCommander(commander);
    commander.parse(args);
    var tracker = new IssueTracker(commander.directory);

    if (commander.args.length === 1) {
      var taskId = commander.args[0];
      tracker.getOpenTask(taskId, function (err, task) {
        if (err) {
          callback(err);
          return;
        }
        if (!task) {
          console.log("No tasks");
        } else {
          console.log(task.getFullDescription());
        }
        callback();
      });
      return;
    }

    callback(new Error("Invalid number of argument for " + this.name));
  }
});
