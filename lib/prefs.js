'use strict';

var fs = require('fs');
var path = require('path');

var prefsFilename = path.resolve("$HOME/.issuetrackerconfig".replace("$HOME", process.env["HOME"]));

exports.getAll = function (callback) {
  fs.readFile(prefsFilename, 'utf8', function (err, data) {
    if (err) {
      callback(new Error('Could not open preferences file "' + prefsFilename + '" (' + err.message + '). Run "issuetracker.js config" and make sure the file is readable.'));
      return;
    }
    var all = JSON.parse(data);
    if (!all.user) {
      all.user = {};
    }
    callback(null, all);
  });
};

exports.save = function (prefs, callback) {
  var json = JSON.stringify(prefs, null, '  ');
  fs.writeFile(prefsFilename, json, function (err) {
    if (err) {
      callback(new Error('Could not save preferences file "' + prefsFilename + '" (' + err.message + '). Make sure the file is writeable.'));
      return;
    }
    callback();
  });
};

exports.getUserNameAndEmail = function (callback) {
  exports.getAll(function (err, prefs) {
    if (err) {
      callback(err);
      return;
    }
    if (!prefs.user.name) {
      callback(new Error('User name not configured. Run "issuetracker.js config".'));
      return;
    }

    var str = prefs.user.name;
    if (prefs.user.email) {
      str += " <" + prefs.user.email + ">";
    } else {
      console.log('User email address not configured. Run "issuetracker.js config".')
    }
    callback(null, str);
  });
};
