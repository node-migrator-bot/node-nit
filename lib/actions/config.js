'use strict';

var ActionBase = require('../actionBase');
var async = require('async');
var prefs = require('../prefs');

module.exports = ActionBase.extend({
  name: 'config',
  shortDescription: 'Configures nit.',
  requiresInit: false,

  populateCommander: function (commander) {
    commander.option('-u, --username <name>', 'The name of the user. (ie John Smith).');
    commander.option('-e, --email <name>', 'The email address of the user. (ie john.smith@gmail.com).');
    commander.option('-e, --editor <name>', 'The editor to use to edit tasks. (ie /usr/bin/vi).');
  },

  cliRun: function (tracker, options, callback) {
    if (options.commander.args.length === 0) {
      this._promptForPrefs(options.commander, function (err, currentPrefs) {
        if (err) {
          callback(err);
          return;
        }
        if (options.commander.verbose) {
          console.log(JSON.stringify(currentPrefs, null, '  '));
        }
        callback(null, currentPrefs);
      });
      return;
    }

    callback(new Error("Invalid number of arguments for " + this.name));
  },

  _getPromptFn: function (commander, prettyName, prefsObj, prefsPropName, cliArg) {
    return function (callback) {
      if (cliArg) {
        prefsObj[prefsPropName] = cliArg;
        callback();
      } else {
        var str = prettyName;
        if (prefsObj[prefsPropName]) {
          str += " (default: " + prefsObj[prefsPropName] + "): ";
        } else {
          str += ": ";
        }
        commander.prompt(str, function (val) {
          if (val.length === 0) {
            val = prefsObj[prefsPropName];
          }
          prefsObj[prefsPropName] = val;
          callback();
        });
      }
    };
  },

  _promptForPrefs: function (commander, callback) {
    var self = this;
    prefs.getAll(function (err, currentPrefs) {
      if (err) {
        currentPrefs = {
          user: {

          }
        };
      }

      currentPrefs.editor = currentPrefs.editor || 'default';

      async.series([
        self._getPromptFn(commander, 'Name', currentPrefs.user, 'name', commander.username),
        self._getPromptFn(commander, 'Email', currentPrefs.user, 'email', commander.email),
        self._getPromptFn(commander, 'Editor', currentPrefs, 'editor', commander.editor),

        prefs.save.bind(prefs, currentPrefs),

        function (callback) {
          process.stdin.destroy();
          callback();
        }
      ], function (err) {
        if (err) {
          callback(err);
          return;
        }
        callback(null, currentPrefs);
      });
    });
  }
});
