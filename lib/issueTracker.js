'use strict';
var fs = require('fs');
var mkdirp = require('mkdirp');
var path = require('path');

exports.init = function (dir, callback) {
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
      callback();
    });
  });
};
