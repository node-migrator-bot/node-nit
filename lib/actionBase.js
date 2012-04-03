'use strict';

var Class = require('./util/class');
var sf = require('sf');
var cliUtils = require('./util/cli');

module.exports = Class.extend({
  requiresInit: true,

  populateCommander: function (commander) {
    commander.option('-d, --directory <path>', 'set the directory where the tasks are stored. Default: ./.nit/', './.nit/');
  },

  cliRun: function (tracker, options, callback) {
    throw new Error("Not Implemented");
  },

  cliUsageArgumentsString: function () {
    return "<options>";
  },

  cliShowHelp: function (commander, callback) {
    this.populateCommander(commander);
    console.log(sf("Usage: {0} {1} {2}", commander.name, this.name, this.cliUsageArgumentsString()));
    console.log();
    console.log('  Options:');
    console.log();
    console.log(commander.optionHelp().replace(/^/gm, '    '));
    console.log();
    callback();
  },

  logTaskErrors: function (task) {
    if (!task.errors || task.errors.length === 0) {
      return false;
    }
    for (var i = 0; i < task.errors.length; i++) {
      console.log(task.errors[i]);
    }
    return true;
  },

  findUser: function (tracker, partialUserName, callback) {
    tracker.resolveUserName(partialUserName, function (err, resolvedUserNames) {
      if (err) {
        return callback(err);
      }
      if (resolvedUserNames.length === 0) {
        return callback(new Error("Could not find user."));
      }

      var opts = {
        options: resolvedUserNames,
        prompt: 'Multiple users found, select one:'
      };
      cliUtils.selectOption(opts, function (err, selectedOption) {
        if (err) {
          return callback(err);
        }

        callback(null, selectedOption);
      });
    });
  },

  findOpenTask: function (tracker, partialTaskId, callback) {
    tracker.resolveTask(partialTaskId, function (err, tasks) {
      if (err) {
        return callback(err);
      }
      if (tasks.length === 0) {
        return callback(new Error("Could not find task."));
      }

      var opts = {
        options: tasks,
        prompt: 'Multiple tasks found, select one:',
        displayFn: function (task) {
          return task.getShortString();
        }
      };
      cliUtils.selectOption(opts, function (err, selectedOption) {
        if (err) {
          return callback(err);
        }

        callback(null, selectedOption);
      });
    });
  }
});
