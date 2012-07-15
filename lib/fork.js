/**
 * hub-fork.js
 *
 * Copyright (c) 2012 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
'use strict';

var hub = require('hubjs');


function createBubble(parent, context) {
  return function () {
    if (this.event !== 'destroy' && this.event !== context.preventBubble) {
      var args = [this.event].concat(Array.prototype.slice.call(arguments));
      this.beforeReturn(function () {
        parent.emit.apply(parent, args);
      });
    }
  };
}


function createDelegate(fork, context, prefixLength) {
  return function () {
    var event = this.event.substring(prefixLength);
    var args  = [event].concat(Array.prototype.slice.call(arguments));
    this.beforeReturn(function () {
      var previous = context.preventBubble;
      context.preventBubble = event;
      fork.emit.apply(fork, args);
      context.preventBubble = previous;
    });
  };
}


function wire(parent, fork, namespace) {
  var context = {};
  var bubble  = createBubble(parent, context);
  fork.on('**', bubble);
  fork.once('destroy', function () {
    fork.un('**', bubble);
  });
  if (namespace) {
    var forward = createDelegate(fork, context, namespace.length + 1);
    var topic   = namespace + '.**';
    parent.on(topic, forward);
    fork.once('destroy', function () {
      parent.un(topic, forward);
    });
  }
}


module.exports = function fork(parent) {
  parent.on('fork', function (namespace, cb) {
    var forked = hub();
    fork(forked);
    wire(parent, forked, namespace);
    return forked;
  });
};
