/**
 * hub-fork.js
 *
 * Copyright (c) 2012 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
'use strict';

var test    = require('utest');
var assert  = require('assert');
var sinon   = require('sinon');

var hub     = require('hubjs');
var fork    = require('../lib/fork');


function emitOnFork(parent, event, args) {
  parent.emit('fork', function (err, forked) {
    forked.emit.apply(forked, [event].concat(args));
  });
}


test('fork-bubble', {

  before: function () {
    this.hub = hub();
    fork(this.hub);
  },


  'should emit event on parent': function () {
    var spy = sinon.spy();
    this.hub.on('test', spy);

    emitOnFork(this.hub, 'test', []);

    sinon.assert.calledOnce(spy);
  },


  'should emit event on parent of namespaced fork': function () {
    var spy = sinon.spy();
    this.hub.on('test', spy);

    this.hub.emit('fork', 'ns', function (err, forked) {
      forked.emit('test');
    });

    sinon.assert.calledOnce(spy);
  },


  'should emit event with dots on parent': function () {
    var spy = sinon.spy();
    this.hub.on('a.b.c', spy);

    emitOnFork(this.hub, 'a.b.c', []);

    sinon.assert.calledOnce(spy);
  },


  'should pass arguments to parent': function () {
    var spy = sinon.spy();
    this.hub.on('foo', spy);

    emitOnFork(this.hub, 'foo', ['abc', 123, {}]);

    sinon.assert.calledOnce(spy);
    sinon.assert.calledWith(spy, 'abc', 123, {});
  },


  'should emit event on parent after emitting on fork': function () {
    var spy1 = sinon.spy();
    var spy2 = sinon.spy();
    this.hub.on('x', spy1);

    this.hub.emit('fork', 'ns', function (err, forked) {
      forked.on('x', spy2);
      forked.emit('x');
    });

    sinon.assert.callOrder(spy2, spy1);
  },


  'should not emit destroy event on parent': function () {
    var spy = sinon.spy();
    this.hub.on('destroy', spy);

    emitOnFork(this.hub, 'destroy', []);

    sinon.assert.notCalled(spy);
  },


  'should not emit event on parent after destroy': function () {
    var spy = sinon.spy();
    this.hub.on('x', spy);

    this.hub.emit('fork', function (err, forked) {
      forked.emit('destroy');
      forked.emit('x');
    });

    sinon.assert.notCalled(spy);
  },


  'should not bubble event from parent': function () {
    var spy = sinon.spy();
    this.hub.on('bubble', spy);

    this.hub.emit('fork', 'ns');
    this.hub.emit('ns.bubble');

    sinon.assert.notCalled(spy);
  },


  'should bubble event after preventing bubble': function () {
    var fork;
    var spy = sinon.spy();
    this.hub.on('bubble', spy);

    this.hub.emit('fork', 'ns', function (err, forked) {
      fork = forked;
    });
    this.hub.emit('ns.bubble');
    fork.emit('bubble');

    sinon.assert.calledOnce(spy);
  },


  'should not bubble multiple events from parent': function () {
    var spyA    = sinon.spy();
    var spyB    = sinon.spy();
    var parent  = this.hub;
    parent.on('a', spyA);
    parent.on('b', spyB);

    parent.emit('fork', 'ns', function (err, forked) {
      forked.on('a', function () {
        parent.emit('ns.b');
      });
    });
    parent.emit('ns.a');

    sinon.assert.notCalled(spyA);
    sinon.assert.notCalled(spyB);
  },


  'should not bubble event after preventing another bubble': function () {
    var spyA    = sinon.spy();
    var spyB    = sinon.spy();
    var parent  = this.hub;
    parent.on('a', spyA);
    parent.on('b', spyB);

    parent.emit('fork', 'ns', function (err, forked) {
      forked.once('a', function () {
        parent.emit('ns.b');
        forked.emit('a');
      });
    });
    parent.emit('ns.a');

    sinon.assert.notCalled(spyA);
    sinon.assert.notCalled(spyB);
  },


  'should bubble event different from parent event': function () {
    var spy = sinon.spy();
    this.hub.on('event', spy);

    this.hub.emit('fork', 'the', function (err, forked) {
      forked.on('other', function () {
        forked.emit('event');
      });
    });
    this.hub.emit('the.other');

    sinon.assert.calledOnce(spy);
  },


  'should receive bubbled event again': function () {
    var spy1 = sinon.spy();
    var spy2 = sinon.spy();
    this.hub.on('ns.forward', spy2);

    this.hub.emit('fork', 'ns', function (err, forked) {
      forked.on('forward', spy1);
      forked.emit('ns.forward');
    });

    sinon.assert.calledOnce(spy1);
    sinon.assert.calledOnce(spy2);
  }

});
