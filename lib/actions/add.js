'use strict';

var ActionBase = require('../actionBase');
var IssueTracker = require('../issueTracker');
var open = require('../util/open');
var fs = require('fs');
var prefs = require('../prefs');
var async = require('async');

module.exports = ActionBase.extend({
  name: 'add',
  shortDescription: 'Adds a task',

  cliRun: function (tracker, options, callback) {
    var self = this;

    async.auto({
      newTask: function (callback) {
        tracker.newTask(options, callback);
      },

      readOriginalContent: ['newTask', function (callback, results) {
        var task = results.newTask;
        fs.readFile(task.filename, 'utf8', callback);
      }],

      openFileForEdit: ['readOriginalContent', function (callback, results) {
        var task = results.newTask;
        if (options.testOpen) {
          options.testOpen(task, callback);
        } else {
          open(options, task.filename, callback);
        }
      }],

      readNewContent: ['openFileForEdit', function (callback, results) {
        var task = results.newTask;
        fs.readFile(task.filename, 'utf8', callback);
      }],

      checkContent: ['readNewContent', function (callback, results) {
        var task = results.newTask;
        var originalContent = results.readOriginalContent;
        var newContent = results.readNewContent;
        if (originalContent === newContent) {
          fs.unlink(task.filename, function (err) {
            if (err) {
              callback(err);
              return;
            }

            callback(new Error("No content changed... Not saving."));
          });
          return;
        }
        callback();
      }],

      // reopen to make sure the task isn't broken
      verifyContent: ['checkContent', function (callback, results) {
        var task = results.newTask;
        tracker.getOpenTask(task.id, callback);
      }],

      writeLastTaskId: ['verifyContent', function (callback, results) {
        var task = results.verifyContent;
        self.logTaskErrors(task);
        prefs.writeLastTaskId(task.id, callback);
      }]
    }, function (err, results) {
      if (err) {
        callback(err);
        return;
      }
      var task = results.newTask;
      console.log("Task " + task.id + " created.")
      callback(null, task);
    });
  }
});
