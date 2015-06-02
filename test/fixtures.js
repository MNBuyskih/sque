"use strict";

var r = require('redis'),
    redis = r.createClient();

module.exports = {
    delAndPush: function (manager, done) {
        redis.del('sq:test', function () {
            manager.push('a');
            manager.push('b');
            manager.push('c');
            manager.push('d');

            manager.push({
                a: 0,
                b: 1,
                c: 2,
                d: 3
            }, done);

        });
    }
};
