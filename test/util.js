/**
 * hub-fork.js
 *
 * Copyright (c) 2012 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
'use strict';

var sinon   = require('sinon');


exports.matchesHub = sinon.match(function (value) {
  return typeof value === 'object' && typeof value.on === 'function' &&
    typeof value.emit === 'function';
}, 'hub');
