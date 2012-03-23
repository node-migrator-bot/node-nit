'use strict';

module.exports = function (app) {
  require('./home')(app);
  require('./tasks')(app);
};
