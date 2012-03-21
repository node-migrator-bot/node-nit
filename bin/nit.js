#!/usr/bin/env node

'use strict';

var action;

if (process.argv.length == 2) {
  action = 'list';
} else {
  for (var i = 2; i < process.argv.length; i++) {
    if (process.argv[i].match(/^-/)) {
      continue;
    }
    action = process.argv[i];
    process.argv.splice(i, 1);
    break;
  }
  if (!action) {
    console.error("You must specify an action");
  }
}

require('../lib/actions').runActionCli(action, process.argv);
