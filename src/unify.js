"use strict";

var BJS = require('./common');

var Nothing = BJS.Nothing;
var Anything = BJS.Anything;
var Literal = BJS.Literal;
var eq = BJS.eq;

function unify (x, y) {
    if (eq(x, y)) {
        return x;
    }
    if (eq(x, Nothing) || eq(y, Nothing)) {
        return Nothing;
    }
    if (eq(x, Anything) || x === undefined) {
        return y;
    }
    if (eq(y, Anything) || y === undefined) {
        return x;
    }
    return Nothing;
}

module.exports = unify;
