'use strict';

exports.escape = function (str) {
  str = str.replace(/</, '&lt;');
  str = str.replace(/>/, '&gt;');
  return str;
};

exports.getFormValueSafeValue = function (str) {
  return exports.escape(str.replace(/"/, '\\"'));
};

exports.getTextareaSafeValue = function (str) {
  return exports.escape(str);
};


