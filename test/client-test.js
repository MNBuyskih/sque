/*global describe, it, beforeEach*/
"use strict";

var fail = require('fail.js'),
    Manager = require('../lib//manager'),
    Client = require('../lib/client'),
    fixtures = require('./fixtures'),
    assert = require('chai').assert;

describe('Client', function () {
    var client;

    beforeEach(function (done) {
        client = new Client('test');
        fixtures.delAndPush(new Manager('test'), done);
    });

    it('should call new job', function (done) {
        client.iAmFree(fail(done, function (jobData) {
            assert.equal(jobData, 'a', 'first test');
            client.iAmFree('id', fail(done, function (jobData) {
                assert.equal(jobData, 'b', 'second test');
                done();
            }));
        }));
    });
});
