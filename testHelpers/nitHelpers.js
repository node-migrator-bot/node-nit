'use strict';

var nit = require('../index');
var path = require('path');
var rimraf = require('rimraf');

exports.createTempNitDirectory = function (options, callback) {
  options.taskPrefix = options.taskPrefix || 'TEST-';
  var dir = path.resolve('./.nittest');
  rimraf(dir, function (err) {
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
