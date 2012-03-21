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
