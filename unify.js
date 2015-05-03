"use strict";

var types = require('./common');

var Nothing = types.Nothing;
var Anything = types.Anything;
var Literal = types.Literal;

function unify (x, y) {
    if (x === Nothing || y === Nothing) {
        return Nothing;
    }
    if (x === Anything || x === undefined) {
        return y;
    }
    if (y === Anything || y === undefined) {
        return x;
    }
    if (x instanceof Literal && y instanceof Literal
        && x.s === y.s) {
        return x;
    }
    return Nothing;
}

module.exports = unify;
