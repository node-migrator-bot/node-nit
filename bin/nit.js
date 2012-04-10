#!/usr/bin/env node

'use strict';

var action;
var needHelp = false;
var i;

for (i = 1; i < process.argv.length; i++) {
  if (process.argv[i] === '-h' || process.argv[i] === '--help') {
    needHelp = true;
  }
}

for (i = 2; i < process.argv.length; i++) {
  if (process.argv[i].match(/^-/)) {
    continue;
  }
  action = process.argv[i];
  process.argv.splice(i, 1);
  break;
}

if (!action) {
  if (needHelp) {
    action = 'help';
  } else {
    action = 'list';
  }
}

require('../lib/actions').runActionCli(action, process.argv);
