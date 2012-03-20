'use strict';

var ActionBase = require('../actionBase');
var IssueTracker = require('../issueTracker');
var prefs = require('../prefs');

module.exports = ActionBase.extend({
  name: 'claim',
  shortDescription: 'Assign a task to yourself.',

  cliUsageArgumentsString: function () {
    return "<taskid> " + this._super();
  },

  cliRun: function (commander, args, callback) {
    this.populateCommander(commander);
    commander.parse(args);
    var tracker = new IssueTracker(commander.directory);

    if (commander.args.length === 1) {
      var taskId = commander.args[0];
      prefs.getAll(function (err, currentPrefs) {
        if (err) {
          callback(err);
          return;
        }
        tracker.assign(taskId, currentPrefs.user, function (err, task) {
          if (err) {
            callback(err);
            return;
          }
          callback();
        });
      });
      return;
    }

    callback(new Error("Invalid number of argument for " + this.name));
  }
});
