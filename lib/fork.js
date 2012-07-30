/**
 * hub-fork.js
 *
 * Copyright (c) 2012 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
'use strict';

var hub = require('hubjs');


function bubble(parent, args, strategy, callback) {
  if (!callback) {
    return function () {
      if (!this.stopped()) {
        parent.emit.apply(parent, args);
      }
    };
  }
  var listener = hub.listen();
  return function (err, values) {
    if (this.stopped()) {
      callback(err, values);
      return;
    }
    if (err) {
      listener.err(err);
    } else {
      listener.push(values);
    }
    var a = args.slice();
    a.push(listener());
    listener.then(function (err, values) {
      if (err) {
        callback(err);
      } else {
        callback(null, strategy(values[0].concat(values[1])));
      }
    });
    parent.emit.apply(parent, a);
  };
}


function forward(fork, emit, prefixLength) {
  return function () {
    var event = this.event.substring(prefixLength);
    emit.apply(fork, [event].concat(this.args()));
  };
}


function wire(parent, fork, namespace) {
  var emit = fork.emit;
  if (namespace) {
    var fn    = forward(fork, emit, namespace.length + 1);
    var topic = namespace + '.**';
    parent.after(topic, fn);
    fork.once('destroy', function () {
      parent.un(topic, fn);
    });
  }
  fork.emit = function (event) {
    var args = Array.prototype.slice.call(arguments);
    if (event !== 'destroy' && event !== 'fork') {
      var strategy, callback;
      if (typeof args[args.length - 1] === 'function') {
        callback = args.pop();
        if (typeof args[args.length - 1] === 'function') {
          strategy = args.pop();
        }
      }
      args.push(hub.CONCAT);
      args.push(bubble(parent, args.slice(), strategy || hub.LAST, callback));
    }
    emit.apply(fork, args);
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
