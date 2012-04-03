'use strict';

var ActionBase = require('../actionBase');
var IssueTracker = require('../issueTracker');

module.exports = ActionBase.extend({
  name: 'comment',
  shortDescription: 'Add a comment to a task.',

  cliUsageArgumentsString: function () {
    return "<taskid> <comment>" + this._super();
  },

  cliRun: function (tracker, options, callback) {
    if (options.args.length === 2) {
      var taskId = options.args[0];
      var comment = options.args[1];
      this.findOpenTask(tracker, taskId, function (err, task) {
        if (err) {
          return callback(err);
        }
        task.addComment(options.user, comment);
        task.updateModifiedAndSave(options.user, callback);
      });
      return;
    }

    callback(new Error("Invalid number of argument for " + this.name));
  }
});
