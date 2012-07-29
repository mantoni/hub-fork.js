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


  'should return given hub': function () {
    var parent = hub();

    var result = fork(parent);

    assert.strictEqual(parent, result);
  },


  'should create new parent and return it': function () {
    var parent = fork();

    assert(util.isHub(parent));
  },


  'should not bubble fork event': function () {
    var parent  = hub();
    var forked  = fork(parent);
    var spy     = sinon.spy();

    parent.on('fork', spy);
    forked.emit('fork', function (err, other) {
      other.emit('fork');
    });

    sinon.assert.calledOnce(spy);
  }

});