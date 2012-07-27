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
var util    = require('./util');


test('fork', {

  before: function () {
    this.hub = hub();
    fork(this.hub);
  },


  'should fork new hub instance on fork emit': function () {
    var spy = sinon.spy();

    this.hub.emit('fork', spy);

    sinon.assert.calledWith(spy, null, util.matchesHub);
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

    sinon.assert.calledWith(spy, null, util.matchesHub);
    assert(this.hub !== spy.firstCall.args[2]);
  }

});
