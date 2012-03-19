'use strict';

var fs = require('fs');
var path = require('path');
var sf = require('sf');
var commander = require('commander');
var version = require('./version');

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
  this.getAction(actionName, function (err, action) {
    if (err) {
      callback(err);
      return;
    }
    commander.version(version);
    commander.option('--verbose', 'Verbose');
    commander.option('-d, --directory <path>', 'set the directory where the tasks are stored. Default: ./.tasks/', './.tasks/');
    action.cliRun(commander, args, callback);
  });
};
