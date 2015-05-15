"use strict";

var types = require('./types');

var Nothing = types.Nothing;
var Anything = types.Anything;
var Literal = types.Literal;
var FStruct = types.FStruct;
var World = types.World;
var Variable = types.Variable;
var eq = types.eq;
var copy = types.copy;

function unify (x, y, newworld, leftmap, rightmap) {
    if (x === undefined) { return copy(y, rightmap); }
    if (y === undefined) { return copy(x, leftmap); }
    if (eq(x, y)) {
        return copy(x); // only primitive values can be eq, so no maps necessary
    }
    if (eq(x, Nothing) || eq(y, Nothing)) {
        return Nothing;
    }
    if (eq(x, Anything)) {
        return copy(y, rightmap);
    }
    if (eq(y, Anything)) {
        return copy(x, leftmap);
    }
    if ((x.borjes_bound !== undefined || y.borjes_bound !== undefined) && (newworld === undefined)) {
        return unifyBound(x, y, leftmap, rightmap);
    }
    if (x.borjes === 'fstruct' && y.borjes === 'fstruct') {
        return unifyFS(x, y, newworld, leftmap, rightmap);
    }
    if (x.borjes === 'variable') {
        return unifyLeftVar(x, y, newworld, leftmap, rightmap);
    }
    if (y.borjes === 'variable') {
        return unifyLeftVar(y, x, newworld, rightmap, leftmap);
    }
    return Nothing;
}

function unifyFS (x, y, nw, lm, rm) {
    var r = FStruct();
    for (var i = 0; i<x.f.length; i++) {
        var f = x.f[i];
        var u = unify(x.v[f], y.v[f], nw, lm, rm);
        if (eq(u, Nothing)) { return Nothing; }
        r.f.push(f);
        r.v[f] = u;
    }
    for (var j = 0; j<y.f.length; j++) {
        var f = y.f[j];
        if (!r.f[f]) {
            r.f.push(f);
            r.v[f] = copy(y.v[f], rm);
        }
    }
    return r;
}

function unifyBound (x, y, leftmap, rightmap) {
    if (leftmap === undefined) { leftmap = {}; }
    if (rightmap === undefined) { rightmap = {}; }
    leftmap.w = x.borjes_bound;
    rightmap.w = y.borjes_bound;
    var u = unify(x, y, World(), leftmap, rightmap);
    if (eq(u, Nothing)) { return Nothing; }
    World.bind(newworld, u);
    return u;
}

function unifyLeftVar (x, y, nw, lm, rm) {
    var v;
    if (x.index === -1) {
        v = undefined;
    } else if (lm[x.index]) {
        v = World.get(nw, lm[x.index]);
    } else {
        v = World.get(lm.w, x.index);
    }
    var u = unify(v, y, nw, lm, rm);
    if (eq(u, Nothing)) { return Nothing; }
    var i = World.put(nw, u);
    if (lm[x.index]) {
        World.set(nw, lm[x.index], Variable(i));
        return Variable(lm[x.index]);
    } else {
        lm[x.index] = i;
        return Variable(i);
    }
}

module.exports = unify;
