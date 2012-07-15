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


  'should not receive event emitted on parent hub': function () {
    var spy = sinon.spy();
    this.hub.emit('fork', function (err, forked) {
      forked.on('test', spy);
    });

    this.hub.emit('test');

    sinon.assert.notCalled(spy);
  },


  'should support fork': function () {
    var spy = sinon.spy();

    this.hub.emit('fork', function (err, forked) {
      forked.emit('fork', spy);
    });

    sinon.assert.calledWith(spy, null, sinon.match.instanceOf(hub.Hub));
    assert(this.hub !== spy.firstCall.args[2]);
  }

});
