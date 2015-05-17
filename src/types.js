"use strict";

var primitive = {};

var Nothing = {
    borjes: 'nothing'
};
primitive['nothing'] = true;

var Anything = {
    borjes: 'anything'
};
primitive['anything'] = true;

function Literal ( string ) {
    return {
        borjes: 'literal',
        s: string
    };
};
primitive['literal'] = true;

// FEATURE STRUCTURE

function FStruct ( object, features ) {
    if (object === undefined) {
        features = [];
    }
    if (features === undefined) {
        features = Object.keys(object);
    }
    var r = {
        borjes: 'fstruct',
        f: features,
        v: {}
    };
    for (var i in r.f) {
        var f = r.f[i];
        r.v[f] = copy(object[f]);
    }
    return r;
}
primitive['fstruct'] = false;

FStruct.set = function ( fs, feat, val ) {
    var i;
    for (i=0; i<fs.f.length; i++) {
        if (fs.f[i] === feat) {
            break;
        }
    }
    if (i==fs.f.length) {
        fs.f.push(feat);
    }
    fs.v[feat] = val;
}

FStruct.get = function ( fs, feat ) {
    return fs.v[feat];
}

function compare_fs ( x, y, wx, wy ) {
    for (var i in x.f) {
        var f = x.f[i];
        if (y.v[f]!==undefined && !compare(x.v[f], y.v[f], wx, wy)) {
            return false;
        }
    }
    return true;
};

function copy_fs ( x, map ) {
    var r = {
        borjes: 'fstruct',
        f: x.f.slice(),
        v: {}
    };
    for (var i in r.f) {
        var f = r.f[i];
        r.v[f] = copy(x.v[f], map);
    }
    return r;
}

// WORLD

function World () {
    return {
        borjes: 'world',
        values: []
    };
}

World.get = function ( world, index ) {
    return world.values[index];
};

World.resolve = function ( world, x ) {
    while (typeof x === 'object' && x.borjes === 'variable') {
        x = world.values[x.index];
    }
    return x;
};

World.bind = function ( world, x ) {
    x.borjes_bound = world;
};

World.put = function ( world, x ) {
    world.values.push(x);
    return world.values.length-1;
};

World.set = function ( world, index, x ) {
    world.values[index] = x;
};

function copy_world ( x, map ) {
    return {
        borjes: 'world',
        values: x.values.map(function(v) {
            return copy(v, map);
        })
    };
}

// VARIABLE

function Variable ( world, value ) {
    return {
        borjes: 'variable',
        index: World.put(world, value)
    };
}

Variable.copy = function ( x, map ) {
    var i;
    if (map) {
        if (map[x.index] !== undefined) {
            i = map[x.index];
        } else {
            i = World.put(map.nw,
                copy(World.get(map.w, x.index),map));
            map[x.index] = i;
        }
    } else {
        i = x.index;
    }
    return {
        borjes: 'variable',
        index: i
    };
}

// PREDICATE

var predicates = {};

function Predicate ( name, params ) {
    return {
        borjes: 'predicate',
        params: params,
        name: name
    };
}

Predicate.create = function ( name, func ) {
    predicates[name] = func;
}

// actually applies it
Predicate.copy = function ( pred, map ) {
    var args = [];
    for (var i=0; i<pred.params.length; i++) {
        args.push(World.resolve(map.nw, Variable.copy(pred.params[i], map)));
    }
    return predicates[pred.name].apply(null, args);
}

// FUNCTIONS

function eq ( x, y ) {
    if (x === y) {
        return true;
    }
    if (x.borjes !== y.borjes) {
        return false;
    }
    if (x.borjes === 'nothing' || y.borjes === 'anything') {
        return true;
    }
    if (x.borjes === 'literal') {
        return x.s === y.s;
    }
    return false;
}

function copy ( x, map ) {
    if (typeof x !== 'object' || primitive[x.borjes]) {
        return x;
    }
    if (x.borjes === 'world') {
        return copy_world(x, map);
    }
    var c = Nothing;
    if (x.borjes === 'fstruct') {
        c = copy_fs(x, map);
    } else if (x.borjes === 'variable') {
        c = Variable.copy(x, map);
    } else if (x.borjes === 'predicate') {
        c = Predicate.copy(x, map);
    }
    if (x.borjes_bound !== undefined) {
        World.bind(map.nw, c);
    }
    return c;
}

function compare ( x, y, worldx, worldy ) {
    if (x.borjes_bound) { worldx = x.borjes_bound; }
    if (y.borjes_bound) { worldy = y.borjes_bound; }
    if (x.borjes === 'variable') {
        return compare(World.get(worldx, x.index), y, worldx, worldy);
    }
    if (y.borjes === 'variable') {
        return compare(x, World.get(worldy, y.index), worldx, worldy);
    }
    if (x.borjes !== y.borjes) {
        return false;
    }
    if (primitive[x.borjes]) {
        return eq(x, y);
    }
    if (x.borjes === 'fstruct') {
        return compare_fs(x, y, worldx, worldy);
    }
    return false;
}

module.exports = {
    Nothing: Nothing,
    Anything: Anything,
    Literal: Literal,
    FStruct: FStruct,
    Variable: Variable,
    World: World,
    Predicate: Predicate,
    eq: eq,
    copy: copy,
    compare: compare
};
