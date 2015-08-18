"use strict";

var types = require('./types');

var Nothing = types.Nothing;
var Anything = types.Anything;
var Literal = types.Literal;
var FStruct = types.FStruct;
var World = types.World;
var Variable = types.Variable;
var Lattice = types.Lattice;
var eq = types.eq;
var copy = types.copy;

/**
 * Unification takes two Borjes objects, and returns their most general unifier.
 *
 * @param {Borjes} x
 * @param {Borjes} y
 * @param {World} [newworld] - this is a private parameter for the recursive
 * call of unify. neworld is a world which unifies the worlds from x and y.
 * @param {WorldMap} [leftmap] - a mapping from the world of x into newworld.
 * @param {WorldMap} [rightmap] - a mapping from the world of y into newworld.
 * @return {Borjes|Nothing} returns the mgu of x and y, with a unifying world
 * bound if either of them had a world bound. If the mgu doesn't exist
 * (unification is not possible/fails) then Nothing is returned.
 */
function unify (x, y, newworld, leftmap, rightmap) {
    if (x !== undefined && x.borjes === 'variable') {
        return unifyLeftVar(x, y, newworld, leftmap, rightmap);
    }
    if (y !== undefined && y.borjes === 'variable') {
        return unifyLeftVar(y, x, newworld, rightmap, leftmap);
    }
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
    if (x.borjes === 'latticeel' && y.borjes === 'latticeel') {
        return Lattice.meet(x, y);
    }
    if ((x.borjes_bound !== undefined || y.borjes_bound !== undefined) && (newworld === undefined)) {
        return unifyBound(x, y, leftmap, rightmap);
    }
    if (x.borjes === 'fstruct' && y.borjes === 'fstruct') {
        return unifyFS(x, y, newworld, leftmap, rightmap);
    }
    if (x.borjes === 'tfstruct') {
        return unifyTFS(x, y, newworld, leftmap, rightmap);
    }
    if (y.borjes === 'tfstruct') {
        return unifyTFS(y, x, newworld, rightmap, leftmap);
    }
    return Nothing;
}

/**
 * Unifies two feature structures.
 *
 * @see unify for params.
 */
function unifyFS (x, y, nw, lm, rm) {
    var r = FStruct();
    var unified = {};
    for (var i = 0; i<x.f.length; i++) {
        var f = x.f[i];
        var u = unify(x.v[f], y.v[f], nw, lm, rm);
        if (eq(u, Nothing)) { return Nothing; }
        r.f.push(f);
        r.v[f] = u;
        unified[f] = true;
    }
    for (var j = 0; j<y.f.length; j++) {
        var f = y.f[j];
        if (!unified[f]) {
            r.f.push(f);
            r.v[f] = unify(x.v[f], y.v[f], nw, lm, rm);
        }
    }
    return r;
}

/**
 * Unifies a typed feature structure with another (possibly typed) feature
 * structure.
 *
 * @param {TFS} x
 * @param {TFS|FStruct} y
 * @see unify for nw, lm and rm params
 */
function unifyTFS (x, y, nw, lm, rm) {
    if (y.borjes === 'tfstruct' || y.borjes === 'fstruct') {
        var type = unify(x.type, y.type, nw, lm, rm);
        if (type === Nothing) { return Nothing; }
        var mgu = unifyFS(x, y, nw, lm, rm);
        if (mgu === Nothing) { return Nothing; }
        mgu.borjes = 'tfstruct';
        mgu.type = type;
        return mgu;
    }
    return Nothing;
}

/**
 * Unifies two objects, at least one of them bound to a world.
 *
 * Creates a new world for the unification and binds it to the mgu.
 * @see unify for the params
 */
function unifyBound (x, y, leftmap, rightmap) {
    /** @TODO check if this two ifs are necessary, if they are true it's
     * possibly an error */
    if (leftmap === undefined) { leftmap = {}; }
    if (rightmap === undefined) { rightmap = {}; }
    var newworld = World();
    leftmap.w = x.borjes_bound;
    leftmap.nw = newworld;
    rightmap.w = y.borjes_bound;
    rightmap.nw = newworld;
    var u = unify(x, y, newworld, leftmap, rightmap);
    if (eq(u, Nothing)) { return Nothing; }
    World.bind(newworld, u);
    return u;
}

/**
 * Unifies a variable with another object (possibly binding its value).
 *
 * @param {Variable} x
 * @see unify for the rest of the params.
 */
function unifyLeftVar (x, y, nw, lm, rm) {
    var v;
    if (lm[x.index] !== undefined) {
        v = World.get(nw, lm[x.index]);
    } else {
        v = World.get(lm.w, x.index);
    }
    var u = unify(v, y, nw, lm, rm);
    if (u !== undefined && eq(u, Nothing)) { return Nothing; }
    var r;
    if (lm[x.index] !== undefined) {
        r = copy(x, lm);
        World.set(nw, lm[x.index], u);
    } else {
        r = Variable(nw, u);
        lm[x.index] = r.index;
    }
    return r;
}

module.exports = unify;
