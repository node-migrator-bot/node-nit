'use strict';

var ActionBase = require('../actionBase');
var IssueTracker = require('../issueTracker');
var open = require('../util/open');

module.exports = ActionBase.extend({
  name: 'add',
  shortDescription: 'Adds a task',

  cliRun: function (commander, args, callback) {
    this.populateCommander(commander);
    commander.parse(args);

    var tracker = new IssueTracker(commander.directory);
    tracker.newTask({}, function (err, task) {
      if (err) {
        callback(err);
        return;
      }
      open(task.filename);
      callback();
    });
  }
});
