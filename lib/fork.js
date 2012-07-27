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
  var forward, topic, preventBubble;
  var bubble = function () {
    var event = this.event;
    if (event !== 'destroy' && event !== preventBubble) {
      var args = [event].concat(this.args());
      parent.emit.apply(parent, args);
    }
  };
  fork.after('**', bubble);
  if (namespace) {
    forward = function () {
      var event     = this.event.substring(namespace.length + 1);
      var args      = [event].concat(this.args());
      var previous  = preventBubble;
      preventBubble = event;
      fork.emit.apply(fork, args);
      preventBubble = previous;
    };
    topic = namespace + '.**';
    parent.after(topic, forward);
  }
  fork.once('destroy', function () {
    fork.un('**', bubble);
    if (namespace) {
      parent.un(topic, forward);
    }
  });
}

module.exports = function fork(parent) {
  parent.on('fork', function (namespace, cb) {
    var forked = hub();
    fork(forked);
    wire(parent, forked, namespace);
    return forked;
  });
};
