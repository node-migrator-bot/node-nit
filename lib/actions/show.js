'use strict';

var ActionBase = require('../actionBase');
var IssueTracker = require('../issueTracker');
var prefs = require('../prefs');

module.exports = ActionBase.extend({
  name: 'show',
  shortDescription: 'Shows the specified task',

  cliUsageArgumentsString: function () {
    return "<taskid> " + this._super();
  },

  _show: function (tracker, options, taskId, callback) {
    this.findOpenTask(tracker, taskId, function (err, task) {
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
  },

  cliRun: function (tracker, options, callback) {
    var self = this;

    if (options.args.length === 0) {
      prefs.getLastTaskId(function (err, taskId) {
        self._show(tracker, options, taskId, callback);
      });
      return;
    }

    if (options.args.length === 1) {
      var taskId = options.args[0];
      this._show(tracker, options, taskId, callback);
      return;
    }

    callback(new Error("Invalid number of argument for " + this.name));
  }
});
