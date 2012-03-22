'use strict';

var fs = require('fs');
var path = require('path');
var sf = require('sf');
var commander = require('commander');
var version = require('./version');
var prefs = require('./prefs');
var IssueTracker = require('./issueTracker');

exports.getActions = function (callback) {
  var basePath = path.join(__dirname, 'actions');
  var actionFiles = fs.readdirSync(basePath);
  var actions = [];
  for (var i = 0; i < actionFiles.length; i++) {
    var filename = path.join(basePath, actionFiles[i]);
    var Action = require(filename);
    actions.push(new Action());
  }
  callback(null, actions);
};

exports.getAction = function (actionName, callback) {
  exports.getActions(function (err, actions) {
    if (err) {
      callback(err);
      return;
    }
    var matches = actions.filter(function (action) { return action.name.toUpperCase() === actionName.toUpperCase(); });
    if (matches.length === 0) {
      callback(new Error("Invalid action '" + actionName + "'"));
      return;
    }
    if (matches.length > 1) {
      callback(new Error("Multiple matched for action '" + actionName + "'"));
      return;
    }
    callback(null, matches[0]);
  });
};

exports.runActionCli = function runActionCli (actionName, args, callback) {
  var self = this;
  args.verbose = args.filter(
    function (arg) {
      return arg === '--verbose'
    }).length > 0;

  callback = callback || function (err) {
    if (err) {
      if (args.verbose) {
        console.error(sf("{0}", err));
      } else {
        console.error(err.message);
      }
    }
  };

  var actionCliRun = function (action, tracker, options, callback) {
    action.cliRun(tracker, options, callback);
  };

  var runAction = function (err, currentPrefs) {
    if (err) {
      callback(err);
      return;
    }

    self.getAction(actionName, function (err, action) {
      if (err) {
        callback(err);
        return;
      }

      action.populateCommander(commander);
      commander.parse(args);
      commander.version(version);
      commander.option('--verbose', 'Verbose');

      var options = {
        commander: commander
      };

      if (action.requiresInit) {
        var tracker = new IssueTracker(commander.directory);
        tracker.verify(function (err) {
          if (err) {
            return callback(new Error("Directory " + commander.directory + " not init'ed."));
          }
          actionCliRun(action, tracker, options, callback);
        });
      } else {
        actionCliRun(action, null, options, callback);
      }
    });
  };

  if (actionName === 'config') {
    runAction();
  } else {
    prefs.getAll(runAction);
  }
};
