"use strict";

var redis = require('redis'),
    _ = require('underscore'),
    noop = function () {
        return arguments;
    },
    fail = require('fail.js');

function Manager(queName, options) {
    var redisOptions = (options && options.redis) || {},
        redisClient = redis.createClient(redisOptions),
        publisher = redis.createClient(redisOptions),
        getKey = function () {
            return _.chain(['sq', queName, arguments]).flatten().compact().value().join(':');
        },
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

                redisClient.rpush([getKey(), data], done || noop);
            },

            publish: function (id, done) {
                if (_.isFunction(id)) {
                    done = id;
                    id = undefined;
                }
                redisClient.lpop(getKey(), fail(done, function (data) {
                    publisher.publish([getKey('jobs', id), data], done || noop);
                }));
            }
        },
        waitForClients = function () {
            var listenner = redis.createClient(redisOptions);
            listenner.subscribe(getKey('iamfree'), fail(function (error) {
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
