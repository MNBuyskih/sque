"use strict";

var redis = require('./redis'),
    getKey = require('./getKey.js'),
    fail = require('fail.js'),
    _ = require('./lodash');

function Client(queName, options) {
    var redisOptions = (options && options.redis) || {},
        publisher = redis(redisOptions),
        listenner = redis(redisOptions),
        publish = function (id, done) {
            var listen = function () {
                listenner.unsubscribe();
                listenner.removeAllListeners('message');

                listenner.subscribe(getKey(queName, 'jobs', id), fail(done, function () {
                    listenner.on('message', function (channel, jobData) {
                        done(null, jobData);
                        return channel;
                    });

                    publisher.publish(getKey(queName, 'iamfree'), id, fail());
                }));
            };

            listen();
        };

    return {
        iAmFree: function (id, done) {
            if (_.isFunction(id)) {
                done = id;
                id = '';
            }

            publish(id, done);
        }
    };
}

module.exports = Client;
