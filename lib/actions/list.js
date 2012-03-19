'use strict';

var ActionBase = require('../actionBase');
var IssueTracker = require('../issueTracker');

module.exports = ActionBase.extend({
  name: 'list',
  shortDescription: 'Lists tasks',

  cliRun: function (commander, args, callback) {
    this.populateCommander(commander);
    commander.parse(args);

    var tracker = new IssueTracker(commander.directory);
    tracker.getTasks(function (err, tasks) {
      if (err) {
        callback(err);
        return;
      }
      if (tasks.length === 0) {
        console.log("No tasks");
      } else {
        for (var i = 0; i < tasks.length; i++) {
          console.log(tasks[i].getShortString());
        }
      }
      callback();
    });
  }
});
