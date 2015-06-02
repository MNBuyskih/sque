"use strict";

var _ = require('./lodash');

module.exports = function () {
    return _.compact(_.flatten(['sq', arguments])).join(':');
};
