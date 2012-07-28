/**
 * hub-fork.js
 *
 * Copyright (c) 2012 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
'use strict';

var hub = require('hubjs');


function wire(parent, fork, namespace) {
  var emit = fork.emit;
  if (namespace) {
    var l = namespace.length + 1;
    var forward = function () {
      var event = this.event.substring(l);
      emit.apply(fork, [event].concat(this.args()));
    };
    var topic = namespace + '.**';
    parent.after(topic, forward);
    fork.once('destroy', function () {
      parent.un(topic, forward);
    });
  }
  fork.emit = function (event) {
    var args = Array.prototype.slice.call(arguments);
    emit.apply(fork, args);
    if (event !== 'destroy') {
      parent.emit.apply(parent, args);
    }
  };
  fork.once('destroy', function () {
    fork.emit = emit;
  });
}

module.exports = function fork(parent) {
  if (!parent) {
    parent = hub();
  }
  parent.on('fork', function (namespace, cb) {
    var forked = fork();
    wire(parent, forked, namespace);
    return forked;
  });
  return parent;
};
