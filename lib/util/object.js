'use strict';

exports.update = function (obj, data) {
  for (var k in data) {
    var val = data[k];
    if (typeof(val) === 'string') {
      obj[k] = val;
      continue;
    }
    if (val instanceof Date) {
      obj[k] = val;
      continue;
    }
    if (k in obj) {
      exports.update(obj[k], val);
    } else {
      obj[k] = val;
    }
  }
};

exports.getByPath = function (obj, path) {
  var pathParts = path.split('.');
  for (var i = 0; i < pathParts.length; i++) {
    var part = pathParts[i];
    if (!obj) {
      return null;
    }
    obj = obj[part];
  }
  return obj;
};

exports.setByPath = function (obj, path, val) {
  var pathParts = path.split('.');
  for (var i = 0; i < pathParts.length - 1; i++) {
    var part = pathParts[i];
    obj = obj[part];
    if (!obj) {
      throw new Error("Invalid path " + path);
    }
  }
  obj[pathParts[pathParts.length - 1]] = val;
};

exports.getValues = function (obj) {
  var results = [];
  for (var k in obj) {
    results.push(obj[k]);
  }
  return results;
};
