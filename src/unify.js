"use strict";

var types = require('./types');

var Nothing = types.Nothing;
var Anything = types.Anything;
var Literal = types.Literal;
var FStruct = types.FStruct;
var World = types.World;
var Variable = types.Variable;
var Lattice = types.Lattice;
var Set = types.Set;
var eq = types.eq;
var copy = types.copy;

// NOTE: worlds must always be in top-level objects. Otherwise everything
// breaks.

/**
 * Creates a new unification context for x and y.
 *
 * @param {Borjes} x
 * @param {Borjes} y
 * @param {Object} defaults
 */
function UniCtx (x, y, defaults) {
    var nw, lm = {}, rm = {};
    if (defaults !== undefined) {
        nw = defaults.newworld ? copy(defaults.newworld) : undefined;
        if (defaults.leftmap) {
            var olm = defaults.leftmap;
            lm._w = olm._w;
            Object.keys(olm).forEach(function (k) {
                if (k !== '_w' && k !== '_nw') {
                    lm[k] = olm[k];
                }
            });
        }
        if (defaults.rightmap) {
            var orm = defaults.rightmap;
            rm._w = orm._w;
            Object.keys(orm).forEach(function (k) {
                if (k !== '_w' && k !== '_nw') {
                    rm[k] = orm[k];
                }
            });
        }
    }
    nw = nw || World();
    lm._nw = nw;
    rm._nw = nw;
    lm._w = lm._w || x.borjes_bound;
    rm._w = rm._w || y.borjes_bound;
    /**
     * The current context of a unification process.
     *
     * @typedef UniCtx
     * @param {World} newworld - this is a private parameter for the recursive
     * call of unify. neworld is a world which unifies the worlds from x and y.
     * @param {WorldMap} leftmap - a mapping from the world of x into newworld.
     * @param {WorldMap} rightmap - a mapping from the world of y into newworld.
     * @param stack
     */
    return {
        newworld: nw,
        leftmap: lm,
        rightmap: rm,
        stack: []
    };
}

/**
 * Returns all possible unifications of x and y.
 *
 * @param {Borjes} x
 * @param {Borjes} y
 * @param {boolean} [as_array=false] - if true, the results are always returned
 * @param {Object} defaults - {newworld, leftmap, rightmap}
 * as an array.
 * @return {Nothing|Borjes|Borjes[]}
 */
function unifyAll (x, y, as_array, defaults) {
    var r = [];
    var stack = [];
    do {
        var ux = UniCtx(x, y, defaults);
        ux.stack = stack;
        var u = unify(x, y, ux);
        if (!eq(u, Nothing)) {
            World.bind(ux.newworld, u);
            u.ux = ux;
            r.push(u);
        }
        stack = ux.stack;
    } while (stack.length > 0);
    if (as_array || r.length > 1) { return r; }
    if (r.length === 1) { return r[0]; }
    return Nothing;
}

/**
 * Unification takes two Borjes objects, and returns their most general unifier.
 *
 * @param {Borjes} x
 * @param {Borjes} y
 * @param {UniCtx} [ux] - the context of the current unification (for recursive
 * calling).
 * @return {Borjes|Nothing} returns the mgu of x and y, with a unifying world
 * bound if either of them had a world bound. If the mgu doesn't exist
 * (unification is not possible/fails) then Nothing is returned.
 */
function unify (x, y, ux) {
    if (x !== undefined && x.borjes === 'disjunct') {
        return unifyDisj(x, y, ux, true);
    }
    if (y !== undefined && y.borjes === 'disjunct') {
        return unifyDisj(x, y, ux, false);
    }
    if (x !== undefined && x.borjes === 'variable') {
        return unifyVar(x, y, ux, true);
    }
    if (y !== undefined && y.borjes === 'variable') {
        return unifyVar(x, y, ux, false);
    }
    if (x === undefined) { return copy(y, ux.rightmap); }
    if (y === undefined) { return copy(x, ux.leftmap); }
    if (eq(x, y)) {
        return copy(x); // only primitive values can be eq, so no maps necessary
    }
    if (eq(x, Nothing) || eq(y, Nothing)) {
        return Nothing;
    }
    if (eq(x, Anything)) {
        return copy(y, ux.rightmap);
    }
    if (eq(y, Anything)) {
        return copy(x, ux.leftmap);
    }
    if (x.borjes === 'latticeel' && y.borjes === 'latticeel') {
        return Lattice.meet(x, y);
    }
    if (x.borjes === 'fstruct' && y.borjes === 'fstruct') {
        return unifyFS(x, y, ux);
    }
    if ((x.borjes === 'tfstruct' && y.borjes === 'tfstruct')
        || (x.borjes === 'tfstruct' && y.borjes === 'fstruct')
        || (x.borjes === 'fstruct' && y.borjes === 'tfstruct')) {
        return unifyTFS(x, y, ux);
    }
    if (x.borjes === 'list' && y.borjes === 'list') {
        return unifyLists(x, y, ux);
    }
    if (x.borjes === 'set_sum' && y.borjes === 'set') {
        return unifyDSum(x, y, ux, true);
    }
    if (y.borjes === 'set_sum' && x.borjes === 'set') {
        return unifyDSum(x, y, ux, false);
    }
    return Nothing;
}

/**
 * Unifies two feature structures.
 *
 * @see unify for params.
 */
function unifyFS (x, y, ux) {
    var r = FStruct();
    var unified = {};
    for (var i = 0; i<x.f.length; i++) {
        var f = x.f[i];
        var u = unify(x.v[f], y.v[f], ux);
        if (eq(u, Nothing)) { return Nothing; }
        r.f.push(f);
        r.v[f] = u;
        unified[f] = true;
    }
    for (var j = 0; j<y.f.length; j++) {
        var f = y.f[j];
        if (!unified[f]) {
            r.f.push(f);
            r.v[f] = unify(x.v[f], y.v[f], ux);
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
 * @see unify for ux
 */
function unifyTFS (x, y, ux) {
    var type = unify(x.type, y.type, ux);
    if (type === Nothing) { return Nothing; }
    var mgu = unifyFS(x, y, ux);
    if (mgu === Nothing) { return Nothing; }
    mgu.borjes = 'tfstruct';
    mgu.type = type;
    return mgu;
}

/**
 * Unifies a variable with another object (possibly binding its value).
 *
 * @param {Variable} x
 * @param {boolean} left - if true, x is variable, otherwise y is.
 * @see unify for the rest of the params.
 */
function unifyVar (x, y, ux, left) {
    var v;
    var map = left ? ux.leftmap : ux.rightmap;
    var who = left ? x.index : y.index;
    if (map[who] !== undefined) {
        v = World.get(ux.newworld, map[who]);
        while (v && v.borjes === 'variable') {
            map[who] = v.index;
            v = World.get(ux.newworld, v.index);
        }
    } else {
        v = World.get(map._w, who);
    }
    var u = left ? unify(v, y, ux) : unify(x, v, ux);
    if (u !== undefined && eq(u, Nothing)) { return Nothing; }
    var r;
    if (map[who] !== undefined) {
        r = copy(left?x:y, map);
        World.set(ux.newworld, map[who], u);
    } else {
        r = Variable(ux.newworld, u);
        map[who] = r.index;
    }
    return r;
}

/**
 * Unifies two non-empty lists.
 *
 * @see unify for the params.
 */
function unifyLists (x, y, ux) {
    var f = unify(x.first, y.first, ux);
    if (eq(f, Nothing)) { return Nothing; }
    var r = unify(x.rest, y.rest, ux);
    if (eq(r, Nothing)) { return Nothing; }
    return types.List(f, r);
}

/**
 * Unifies two disjuncts.
 *
 * @param {boolean} left - if true, x is a disjunct, otherwise y is.
 * @see unify for the params.
 */
function unifyDisj (x, y, ux, left) {
    var st = ux.stack;
    var who = left ? x : y;
    var uip = who.borjes_uip;
    var ix, u;
    if (!uip) {
        who.borjes_uip = { at: 0 };
        uip = who.borjes_uip;
        st.push(uip);
    }
    var u = left ? unify(x.a[uip.at], y, ux)
                 : unify(x, y.a[uip.at], ux);
    if (st[st.length-1] === uip) {
        uip.at += 1;
        if (uip.at >= who.a.length) {
            st.pop();
            delete who.borjes_uip;
        }
    }
    return u;
}

/**
 * Unifies a direct sum with a set, decomposing it.
 *
 * @param {boolean} left - if true, x is a direct sum, otherwise y is.
 * @see unify for the params.
 */
function unifyDSum (x, y, ux, left) {
    var st = ux.stack;
    var who = left ? x : y;
    var list = left ? y : x;
    var uip = who.borjes_uip;
    var ix, u;
    if (!uip) {
        who.borjes_uip = { at: 0 };
        uip = who.borjes_uip;
        st.push(uip);
    }
    var u = left ? unify(x.el, y.e[uip.at], ux)
                 : unify(x.e[uip.at], y.el, ux);
    if (st[st.length-1] === uip) {
        uip.at += 1;
        if (uip.at >= list.e.length) {
            st.pop();
            delete who.borjes_uip;
        }
    }
    if (eq(u, Nothing)) { return Nothing; }
    var rem = [];
    var map = left?ux.rightmap:ux.leftmap;
    for (var i=0; i<list.e.length; i++) {
        if (i!==uip.at-1) {
            rem.push(copy(list.e[i], map));
        }
    }
    var rest = left ? unify(x.rest, Set.apply(null, rem), ux)
                    : unify(Set.apply(null, rem), y.rest, ux);
    if (eq(rest, Nothing)) { return Nothing; }
    return Set.sum(u, rest);
}

module.exports = unifyAll;
