/*global describe, it, beforeEach, afterEach*/
"use strict";

var assert = require('chai').assert,
    Manager = require('../lib/manager.js'),
    r = require('redis'),
    redis = r.createClient(),
    fail = require('fail.js');

describe('Manager', function () {
    var m = new Manager('test'),
        c = r.createClient(),
        client;

    beforeEach(function (done) {
        redis.del('sq:test', function () {
            m.push('a');
            m.push('b');
            m.push('c');
            m.push('d');

            m.push({
                a: 0,
                b: 1,
                c: 2,
                d: 3
            }, done);

        });

    });

    describe('push', function () {
        it('should add job to redis', function (done) {
            m.push('i am a new job', function (error) {
                if (error) {
                    done(error);
                } else {
                    redis.lrange(['sq:test', 0, 0], function (error, result) {
                        if (error) {
                            done(error);
                        } else {
                            assert.lengthOf(result, 1);
                            assert.equal(result[0], 'a');
                            done();
                        }
                    });
                }
            });
        });
    });

    describe('publish', function () {
        it('should push message with new job', function (done) {
            client = r.createClient();
            client.subscribe('sq:test:jobs', fail(done, function () {
                client.on('message', function (channel, data) {
                    assert.equal(channel, 'sq:test:jobs');
                    assert.equal(data, 'a');
                    done();
                });

                m.publish();
            }));
        });
    });

    it('should listen for new clients', function (done) {
        client = r.createClient();
        client.subscribe('sq:test:jobs:customid', fail(done, function () {
            client.on('message', function (channel, data) {
                assert.equal(channel, 'sq:test:jobs:customid');
                assert.equal(data, 'a');
                done();
            });

            c.publish(['sq:test:iamfree', 'customid'], fail.noop);
        }));
    });
});
