'use strict';

var nit = require('../index');
var path = require('path');
var rimraf = require('rimraf');
var objectUtils = require('../lib/util/object');

exports.initTempDir = function (callback) {
  var dir = path.resolve('./.nittest');
  rimraf(dir, function (err) {
    if (err) {
      return callback(err);
    }
    callback(null, dir);
  });
};

exports.createTempNitDirectory = function (options, callback) {
  options.taskPrefix = options.taskPrefix || 'TEST-';
  exports.initTempDir(function (err, dir) {
    if (err) {
      return callback(err);
    }
    nit.IssueTracker.create(dir, options, function (err) {
      if (err) {
        return callback(err);
      }
      callback(null, dir);
    });
  });
};

exports.createTask = function (dir, data, callback) {
  var tracker = new nit.IssueTracker(dir);
  tracker.newTask({
    user: exports.getTestUser()
  }, function (err, task) {
    if (err) {
      return callback(err);
    }
    tracker.getOpenTask(task.id, function (err, task) {
      if (err) {
        return callback(err);
      }

      objectUtils.update(task, data);

      task.save(function (err) {
        if (err) {
          return callback(err);
        }
        callback(null, task);
      });
    });
  });
};

exports.getTestUser = function () {
  return nit.User.fromJson({
    name: 'test user',
    email: 'test@user.com'
  });
};

exports.replaceDates = function (str) {
  str = str.replace(/([0-9]*?)\/([0-9]*?)\/([0-9]*?) ([0-9]*?):([0-9]*?):([0-9]*?) [AP]M/g, '--date--');
  return str;
};

