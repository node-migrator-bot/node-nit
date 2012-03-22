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
      tracker.addComment(taskId, options.user, comment, callback);
      return;
    }

    callback(new Error("Invalid number of argument for " + this.name));
  }
});
