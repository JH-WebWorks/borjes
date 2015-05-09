"use strict";

var types = require('./types');

var Nothing = types.Nothing;
var Anything = types.Anything;
var Literal = types.Literal;
var FStruct = types.FStruct;
var eq = types.eq;
var copy = types.copy;

function unify (x, y) {
    if (eq(x, y)) {
        return copy(x);
    }
    if (eq(x, Nothing) || eq(y, Nothing)) {
        return Nothing;
    }
    if (eq(x, Anything) || x === undefined) {
        return copy(y);
    }
    if (eq(y, Anything) || y === undefined) {
        return copy(x);
    }
    if (x.borjes === 'fstruct' && y.borjes === 'fstruct') {
        return unifyFS(x, y);
    }
    return Nothing;
}

function unifyFS (x, y) {
    var r = FStruct();
    for (var i = 0; i<x.f.length; i++) {
        var f = x.f[i];
        var u = unify(x.v[f], y.v[f]);
        if (eq(u, Nothing)) { return Nothing; }
        fs.f.push(f);
        fs.v[f] = u;
    }
    for (var j = 0; j<y.f.length; j++) {
        var f = y.f[j];
        if (!fs.f[f]) {
            fs.f.push(f);
            fs.v[f] = copy(y.v[f]);
        }
    }
    return r;
}

module.exports = unify;
