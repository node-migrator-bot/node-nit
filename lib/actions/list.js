'use strict';

var ActionBase = require('../actionBase');
var IssueTracker = require('../issueTracker');
var Task = require('../task');
var sf = require('sf');
var inflection = require('inflection');

var ext = require('extension');
ext.registerAndUse(Array.prototype, ext.array);
ext.registerAndUse(Object.prototype, ext.object);

module.exports = ActionBase.extend({
  name: 'list',
  shortDescription: 'Lists tasks',

  populateCommander: function (commander) {
    this._super(commander);
    commander.option('-a, --all', 'Show all of the tasks.');
  },

  _filterTasks: function (currentPrefs, commander, task) {
    if (commander.all) {
      return true;
    }

    // default: assigned to me or not assigned and open
    if (task.getStatus() !== 'open') {
      return false;
    }

    if (task.isAssignedTo(currentPrefs.user)) {
      return true;
    }
    if (!task.isAssigned()) {
      return true;
    }

    return false;
  },

  _groupBy: function (currentPrefs, task) {
    if (task.getStatus() === 'open' && task.isAssignedTo(currentPrefs.user)) {
      return 'assigned to me';
    }
    return task.getStatus();
  },

  cliRun: function (currentPrefs, commander, args, callback) {
    var self = this;
    this.populateCommander(commander);
    commander.parse(args);

    var tracker = new IssueTracker(commander.directory);
    tracker.getOpenTasks(function (err, tasks) {
      if (err) {
        callback(err);
        return;
      }

      tasks = tasks.filter(self._filterTasks.bind(self, currentPrefs, commander));

      if (tasks.length === 0) {
        console.log();
        console.log("No tasks");
      } else {
        var groupedTasks = tasks
          .groupBy(self._groupBy.bind(self, currentPrefs))
          .toArray()
          .sort(function (a, b) { return Task.getStatusPrecedence(a.key) - Task.getStatusPrecedence(b.key); });
        for (var gti = 0; gti < groupedTasks.length; gti++) {
          console.log();
          console.log(inflection.humanize(groupedTasks[gti].key));
          var tasks = groupedTasks[gti].value;
          for (var i = 0; i < tasks.length; i++) {
            console.log(sf.indent(tasks[i].getShortString()));
          }
        }
      }
      console.log();
      callback();
    });
  }
});
