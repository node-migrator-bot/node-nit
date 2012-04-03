'use strict';

var ActionBase = require('../actionBase');
var sf = require('sf');

module.exports = ActionBase.extend({
  name: 'close',
  shortDescription: 'Closes a task.',

  cliUsageArgumentsString: function () {
    return "<taskid> " + this._super();
  },

  populateCommander: function (commander) {
    this._super(commander);
  },

  cliRun: function (tracker, options, callback) {
    if (options.args.length === 1) {
      var taskId = options.args[0];
      this.findOpenTask(tracker, taskId, function (err, task) {
        if (err) {
          return callback(err);
        }

        task.setStatus('closed');
        task.updateModifiedAndSave(options.user, function (err, task) {
          if (err) {
            return callback(err);
          }
          console.log(sf('Task {id} closed.', task));
          callback(null, task);
        });
      });
      return;
    }

    callback(new Error("Invalid number of argument for " + this.name));
  }
});
