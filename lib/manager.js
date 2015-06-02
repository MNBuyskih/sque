"use strict";

var redis = require('redis'),
    _ = require('underscore'),
    fail = require('fail.js'),
    getKey = require('./getKey.js');

function Manager(queName, options) {
    var redisOptions = (options && options.redis) || {},
        redisClient = redis.createClient(redisOptions),
        publisher = redis.createClient(redisOptions),
        manager = {
            push: function (data, done) {
                if (_.isFunction(data)) {
                    done = data;
                    data = '';
                }

                if (!_.isString(data)) {
                    try {
                        data = JSON.stringify(data);
                    } catch (e) {
                        done(e);
                    }
                }

                redisClient.rpush([getKey(queName), data], done || fail.noop);
            },

            publish: function (id, done) {
                if (_.isFunction(id)) {
                    done = id;
                    id = undefined;
                }
                redisClient.lpop(getKey(queName), fail(done, function (data) {
                    publisher.publish(getKey(queName, 'jobs', id), data, done || fail.noop);
                }));
            }
        },
        waitForClients = function () {
            var listenner = redis.createClient(redisOptions);
            listenner.subscribe(getKey(queName, 'iamfree'), fail(function (error) {
                console.error(error);
            }));
            listenner.on('message', function (channel, id) {
                manager.publish(id);
                return channel;
            });
        };

    waitForClients();

    return manager;
}

module.exports = Manager;
