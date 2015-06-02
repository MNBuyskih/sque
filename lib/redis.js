"use strict";

var redis = require('redis'),
    _ = require('./lodash');

module.exports = function (options) {
    options = _.defaults({
        port: 6379,
        host: '127.0.0.1'
    }, options);

    return redis.createClient.call(null, options.port, options.host, _.omit(options, 'port', 'host'));
};
