/**
 * hub-fork.js
 *
 * Copyright (c) 2012 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
'use strict';

var test      = require('utest');
var assert    = require('assert');
var sinon     = require('sinon');

var hub       = require('hubjs');
var fork      = require('../lib/fork');


function setupFork(parent, namespace, event) {
  var spy = sinon.spy();
  parent.emit('fork', namespace || 'ns', function (err, forked) {
    if (err) {
      throw err;
    }
    forked.on(event || 'test', spy);
  });
  return spy;
}


test('fork-namespace', {

  before: function () {
    this.hub = hub();
    fork(this.hub);
  },


  'should fork new hub instance on fork emit': function () {
    var spy = sinon.spy();

    this.hub.emit('fork', 'ns', spy);

    sinon.assert.calledWith(spy, null, sinon.match.instanceOf(hub.Hub));
    assert(this.hub !== spy.firstCall.args[2]);
  },


  'should receive event emitted on parent hub': function () {
    var spy = setupFork(this.hub);

    this.hub.emit('ns.test');

    sinon.assert.calledOnce(spy);
  },


  'should receive event with dots emitted on parent hub': function () {
    var spy = setupFork(this.hub, 'some', 'test.abc');

    this.hub.emit('some.test.abc');

    sinon.assert.calledOnce(spy);
  },


  'should not receive event if namespace does not match': function () {
    var spy = setupFork(this.hub);

    this.hub.emit('xx.test');

    sinon.assert.notCalled(spy);
  },


  'should pass arguments to forked instance': function () {
    var spy = setupFork(this.hub);

    this.hub.emit('ns.test', 123, 'abc', {});

    sinon.assert.calledWith(spy, 123, 'abc', {});
  },


  'should not receive any events after parent destroy event': function () {
    var spy = sinon.spy();
    this.hub.emit('fork', 'ns', function (err, forked) {
      forked.on('nope', spy);
    });

    this.hub.emit('ns.destroy');
    this.hub.emit('ns.nope');

    sinon.assert.notCalled(spy);
  },


  'should not receive any events after own destroy event': function () {
    var spy = sinon.spy();
    this.hub.emit('fork', 'ns', function (err, forked) {
      forked.on('nope', spy);
      forked.emit('destroy');
    });

    this.hub.emit('ns.nope');

    sinon.assert.notCalled(spy);
  }

});
