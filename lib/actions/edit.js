'use strict';

var ActionBase = require('../actionBase');
var IssueTracker = require('../issueTracker');
var open = require('../util/open');
var prefs = require('../prefs');
var async = require('async');

module.exports = ActionBase.extend({
  name: 'edit',
  shortDescription: 'Edit a task',

  _editTaskId: function (currentPrefs, commander, taskId, callback) {
    var tracker = new IssueTracker(commander.directory);

    async.auto({
      getTask: function (callback) {
        tracker.getOpenTask(taskId, callback);
      },

      openForEdit: ['getTask', function (callback, results) {
        var task = results.getTask;
        open(currentPrefs, task.filename, callback);
      }],

      // reopen to make sure the task isn't broken
      verifyContent: ['openForEdit', function (callback, results) {
        var task = results.getTask;
        tracker.getOpenTask(task.id, callback);
      }],

      writeLastTaskId: ['verifyContent', function (callback, results) {
        var task = results.getTask;
        prefs.writeLastTaskId(task.id, callback);
      }]
    }, callback);
  },

  cliRun: function (currentPrefs, commander, tracker, callback) {
    var self = this;

    if (commander.args.length === 0) {
      prefs.getLastTaskId(function (err, taskId) {
        self._editTaskId(currentPrefs, commander, taskId, callback);
      });
      return;
    }

    if (commander.args.length === 1) {
      var taskId = commander.args[0];
      self._editTaskId(currentPrefs, commander, taskId, callback);
      return;
    }

    callback(new Error("Invalid number of argument for " + this.name));
  }
});
