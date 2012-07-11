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


function setupFork(parent, event) {
  var spy = sinon.spy();
  parent.emit('fork', function (err, forked) {
    if (err) {
      throw err;
    }
    forked.on(event || 'test', spy);
  });
  return spy;
}


test('fork', {

  before: function () {
    this.hub = hub();
    fork(this.hub);
  },


  'should fork new hub instance on fork emit': function () {
    var spy = sinon.spy();

    this.hub.emit('fork', spy);

    sinon.assert.calledWith(spy, null, sinon.match.instanceOf(hub.Hub));
    assert(this.hub !== spy.firstCall.args[2]);
  },


  'should receive event emitted on parent hub': function () {
    var spy = setupFork(this.hub);

    this.hub.emit('test');

    sinon.assert.calledOnce(spy);
  },


  'should receive event with dots emitted on parent hub': function () {
    var spy = setupFork(this.hub, 'test.abc');

    this.hub.emit('test.abc');

    sinon.assert.calledOnce(spy);
  },


  'should pass arguments to forked instance': function () {
    var spy = setupFork(this.hub);

    this.hub.emit('test', 123, 'abc', {});

    sinon.assert.calledWith(spy, 123, 'abc', {});
  },


  'should not receive any events after parent destroy event': function () {
    var spy = sinon.spy();
    this.hub.emit('fork', function (err, forked) {
      forked.on('nope', spy);
    });

    this.hub.emit('destroy');
    this.hub.emit('nope');

    sinon.assert.notCalled(spy);
  },


  'should not receive any events after own destroy event': function () {
    var spy = sinon.spy();
    this.hub.emit('fork', function (err, forked) {
      forked.on('nope', spy);
      forked.emit('destroy');
    });

    this.hub.emit('destroy');
    this.hub.emit('nope');

    sinon.assert.notCalled(spy);
  }

});
