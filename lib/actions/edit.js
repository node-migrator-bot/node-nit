'use strict';

var ActionBase = require('../actionBase');
var IssueTracker = require('../issueTracker');
var open = require('../util/open');
var prefs = require('../prefs');
var async = require('async');

module.exports = ActionBase.extend({
  name: 'edit',
  shortDescription: 'Edit a task',

  _editTaskId: function (tracker, options, taskId, callback) {
    var self = this;

    async.auto({
      getTask: function (callback) {
        self.findOpenTask(tracker, taskId, callback);
      },

      openForEdit: ['getTask', function (callback, results) {
        var task = results.getTask;
        if (options.testOpen) {
          options.testOpen(task, callback);
        } else {
          open(options, task.filename, callback);
        }
      }],

      // reopen to make sure the task isn't broken
      verifyContent: ['openForEdit', function (callback, results) {
        var task = results.getTask;
        tracker.getOpenTask(task.id, callback);
      }],

      updateModified: ['verifyContent', function (callback, results) {
        var task = results.verifyContent;
        if (self.logTaskErrors(task)) {
          return callback(null, task);
        }
        task.updateModifiedAndSave(options.user, callback);
      }],

      writeLastTaskId: ['updateModified', function (callback, results) {
        var task = results.getTask;
        prefs.writeLastTaskId(task.id, callback);
      }]
    }, callback);
  },

  cliRun: function (tracker, options, callback) {
    var self = this;

    if (options.args.length === 0) {
      prefs.getLastTaskId(function (err, taskId) {
        self._editTaskId(tracker, options, taskId, callback);
      });
      return;
    }

    if (options.args.length === 1) {
      var taskId = options.args[0];
      self._editTaskId(tracker, options, taskId, callback);
      return;
    }

    callback(new Error("Invalid number of argument for " + this.name));
  }
});
