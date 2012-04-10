'use strict';

var fs = require('fs');
var path = require('path');
var sf = require('sf');
var commander = require('commander');
var version = require('./version');
var prefs = require('./prefs');
var IssueTracker = require('./issueTracker');
var objectUtils = require('./util/object');

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
  actionName = actionName || '';

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

  if (actionName === 'help') {
    args = args.filter(function (arg) {
      if (arg === '-h' || arg === '--help') {
        return false;
      }
      return true;
    });
  }

  callback = callback || function (err) {
    if (err) {
      if (args.verbose) {
        console.error(sf("{0}", err));
      } else {
        console.error(err.message);
      }
      process.exit(-1);
    }
    process.exit(0);
  };

  var actionCliRun = function (action, tracker, options, cb) {
    action.cliRun(tracker, options, cb);
  };

  var runAction = function (homePrefs, localPrefs) {
    self.getAction(actionName, function (err, action) {
      if (err) {
        return callback(err);
      }

      action.populateCommander(commander);
      commander.parse(args);
      commander.version(version);
      commander.option('--verbose', 'Verbose');

      var options = {
      };

      // merge home prefs into options
      if (homePrefs) {
        objectUtils.update(options, homePrefs);
      }

      // merge local prefs into options
      if (localPrefs) {
        objectUtils.update(options, localPrefs);
      }

      // merge commander options into options
      objectUtils.update(options, commander);
      options.commander = commander;

      if (action.requiresInit) {
        var tracker = new IssueTracker(options.directory);
        tracker.verify(function (err) {
          if (err) {
            return callback(new Error("Directory " + options.directory + " not init'ed."));
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
    prefs.getAll(function (err, homePrefs) {
      if (err) {
        return callback(err);
      }

      fs.readFile('./.nitconfig', 'utf8', function (err, data) {
        var localPrefs;
        if (data) {
          localPrefs = JSON.parse(data);
        }
        runAction(homePrefs, localPrefs);
      });
    });
  }
};
