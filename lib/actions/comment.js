'use strict';

var ActionBase = require('../actionBase');
var IssueTracker = require('../issueTracker');
var prefs = require('../prefs');

module.exports = ActionBase.extend({
  name: 'comment',
  shortDescription: 'Add a comment to a task.',

  cliUsageArgumentsString: function () {
    return "<taskid> <comment>" + this._super();
  },

  cliRun: function (commander, args, callback) {
    this.populateCommander(commander);
    commander.parse(args);
    var tracker = new IssueTracker(commander.directory);

    if (commander.args.length === 2) {
      var taskId = commander.args[0];
      var comment = commander.args[1];
      prefs.getAll(function (err, currentPrefs) {
        if (err) {
          callback(err);
          return;
        }
        tracker.addComment(taskId, currentPrefs.user, comment, callback);
      });
      return;
    }

    callback(new Error("Invalid number of argument for " + this.name));
  }
});
