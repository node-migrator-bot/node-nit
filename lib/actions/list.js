'use strict';

var ActionBase = require('../actionBase');
var IssueTracker = require('../issueTracker');
var Task = require('../task');
var ext = require('extension');
var sf = require('sf');
var inflection = require('inflection');

ext.register(Array.prototype, ext.array);
ext.register(Object.prototype, ext.object);
ext.use(Array.prototype);
ext.use(Object.prototype);

module.exports = ActionBase.extend({
  name: 'list',
  shortDescription: 'Lists tasks',

  cliRun: function (commander, args, callback) {
    this.populateCommander(commander);
    commander.parse(args);

    var tracker = new IssueTracker(commander.directory);
    tracker.getOpenTasks(function (err, tasks) {
      if (err) {
        callback(err);
        return;
      }
      if (tasks.length === 0) {
        console.log("No tasks");
      } else {
        var groupedTasks = tasks
          .groupBy(function (task) { return task.getStatus(); })
          .toArray()
          .sort(function (a, b) { return Task.getStatusPrecedence(a.key) - Task.getStatusPrecedence(b.key); });
        for (var gti = 0; gti < groupedTasks.length; gti++) {
          console.log(inflection.humanize(groupedTasks[gti].key));
          var tasks = groupedTasks[gti].value;
          for (var i = 0; i < tasks.length; i++) {
            console.log(sf.indent(tasks[i].getShortString()));
          }
        }
      }
      callback();
    });
  }
});
