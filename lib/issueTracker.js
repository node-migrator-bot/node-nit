'use strict';

var Class = require('./util/class');
var fs = require('fs');
var mkdirp = require('mkdirp');
var path = require('path');
var Task = require('./task');
var async = require('async');

module.exports = Class.extend({
  init: function (dir) {
    this.dir = path.resolve(dir);
  },

  getOptions: function (callback) {
    fs.readFile(path.join(this.dir, 'options.json'), 'utf8', function (err, data) {
      if (err) {
        callback(err);
        return;
      }
      var options = JSON.parse(data);
      callback(null, options);
    });
  },

  getTasks: function (callback) {
    var self = this;
    fs.readdir(this.dir, function (err, files) {
      if (err) {
        callback(err);
        return;
      }
      var tasks = files
        .filter(function (fileName) { return !self._isInternalFile(path.basename(fileName)); })
        .map(function (fileName) { return new Task(fileName); });
      callback(null, tasks);
    });
  },

  _isInternalFile: function (fname) {
    switch (fname) {
      case 'options.json':
      case 'template.task':
        return true;
      default:
        return false;
    }
  }
});

module.exports.create = function (dir, options, callback) {
  dir = path.resolve(dir);
  fs.exists(dir, function (exists) {
    if (exists) {
      callback(new Error("Path '" + dir + "' already exists."));
      return;
    }
    mkdirp(dir, function (err) {
      if (err) {
        callback(err);
        return;
      }

      var optionsStr = JSON.stringify(options, null, '   ');
      var templteStr = [
        'Title: ',
        'Status: Open',
        'Assigned To: ',
        'Created By: <%= currentUser %>',
        'Created Date: <%= new Date() %>',
        'Modified Date: <%= new Date() %>',
        'Description:',
        '',
        'Comments:',
        ''
      ].join('\n');
      async.parallel([
        fs.writeFile.bind(fs, path.join(dir, 'options.json'), optionsStr),
        fs.writeFile.bind(fs, path.join(dir, 'template.task'), templteStr)
      ], callback);
    });
  });
};
