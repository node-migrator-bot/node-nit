'use strict';

var ActionBase = require('../actionBase');
var IssueTracker = require('../issueTracker');
var open = require('../util/open');
var fs = require('fs');

module.exports = ActionBase.extend({
  name: 'add',
  shortDescription: 'Adds a task',

  cliRun: function (currentPrefs, commander, args, callback) {
    this.populateCommander(commander);
    commander.parse(args);

    var tracker = new IssueTracker(commander.directory);
    tracker.newTask({
      prefs: currentPrefs
    }, function (err, task) {
      if (err) {
        callback(err);
        return;
      }
      fs.readFile(task.filename, 'utf8', function (err, originalContent) {
        if (err) {
          callback(err);
          return;
        }

        open(currentPrefs, task.filename, function (err) {
          if (err) {
            callback(err);
            return;
          }

          fs.readFile(task.filename, 'utf8', function (err, newContent) {
            if (err) {
              callback(err);
              return;
            }

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

            // reopen to make sure the task isn't broken
            tracker.getOpenTask(task.id, function (err) {
              if (err) {
                callback(err);
                return;
              }

              console.log("Task " + task.id + " created.")
              callback();
            });
          });
        });
      });
    });
  }
});
