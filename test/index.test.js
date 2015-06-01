/*global describe, it*/
"use strict";

var assert = require('chai').assert,
    index = require('../lib/index.js'),
    Manager = require('../lib//manager.js');

describe('index', function () {
    it('should be an object', function () {
        assert.isObject(index);
    });

    describe('.manager', function () {
        it('should be a function', function () {
            assert.isFunction(index.manager);
        });
    });
});
