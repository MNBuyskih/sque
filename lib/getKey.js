"use strict";

var _ = require('underscore');

module.exports = function () {
    return _.chain(['sq', arguments]).flatten().compact().value().join(':');
};
