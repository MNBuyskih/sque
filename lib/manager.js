"use strict";

var redis = require('./redis'),
    _ = require('./lodash'),
    fail = require('fail.js'),
    getKey = require('./getKey.js');

function Manager(queName, options) {
    function log() {
        if (options.debug) {
            console.log.apply(null, _.toArray(arguments));
        }
    }

    var redisOptions = (options && options.redis) || {},
        redisClient = redis(redisOptions),
        publisher = redis(redisOptions),
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
                redisClient.lrange([getKey(queName), 0, 0], fail(done, function (data) {
                    log('%s ask for new job', queName);

                    if (data.length) {
                        var confirm = redis();
                        confirm.subscribe(getKey(queName, 'jobConfirm', id), function () {
                            confirm.on('message', function (channel, message) {
                                if (message !== 'ok') {
                                    return;
                                }

                                // Удаляем задачу из очереди только если пришло подтверждение
                                redisClient.lrem([getKey(queName), 1, data[0]], done || fail.noop);

                                confirm.unsubcribe();

                                return channel;
                            });

                            publisher.publish(getKey(queName, 'jobs', id), data[0], fail.noop);
                        });
                    }
                }));
            }
        },
        waitForClients = function () {
            var listenner = redis(redisOptions);
            listenner.subscribe(getKey(queName, 'iamfree'), function () {
                listenner.on('message', function (channel, id) {
                    manager.publish(id);
                    return channel;
                });
            });
        };

    waitForClients();

    return manager;
}

module.exports = Manager;
