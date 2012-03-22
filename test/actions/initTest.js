'use strict';

var InitAction = require('../../lib/actions/init');
var nit = require('../../index');
var nitHelpers = require('../../testHelpers/nitHelpers');
var fs = require('fs');
var path = require('path');

module.exports = {
  'init task': function (test) {
    var self = this;
    nitHelpers.initTempDir(function (err, dir) {
      if (err) {
        throw err;
      }
      var action = new InitAction();
      var options = {
        user: nitHelpers.getTestUser(),
        verbose: true,
        directory: dir,
        args: [
        ]
      };
      action.cliRun(null, options, function (err) {
        if (err) {
          throw err;
        }

        fs.readFile(path.join(dir, 'options.json'), 'utf8', function (err, data) {
          if (err) {
            throw err;
          }
          var config = JSON.parse(data);
          test.done();
        });
      });
    });
  }
};
