/**
 * hub-fork.js
 *
 * Copyright (c) 2012 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
'use strict';

var hub = require('hubjs');


function createDelegate(fork, prefixLength) {
  return function () {
    var event = this.event.substring(prefixLength);
    var args  = [event].concat(Array.prototype.slice.call(arguments));
    fork.emit.apply(fork, args);
  };
}


function wire(parent, fork, namespace) {
  var topic     = namespace ? namespace + '.**' : '**';
  var delegate  = createDelegate(fork, namespace ? namespace.length + 1 : 0);
  parent.on(topic, delegate);
  fork.once('destroy', function () {
    parent.un(topic, delegate);
  });
}


module.exports = function (parent) {
  parent.on('fork', function (namespace, cb) {
    var fork = hub();
    wire(parent, fork, namespace);
    return fork;
  });
};
