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

// LATTICE

var lattice_names = 1;
var lattices = {};
function Lattice (max_elements, name) {
    if (name === undefined) {
        name = lattice_names++;
    }
    var r = {
        borjes: 'lattice',
        n: 0,
        name: name,
        nels: Math.floor((max_elements-1)/32)+1,
        elem: {}, // from bitarray to string
        bits: {}, // from string to bitarray
    };
    lattices[name] = r;
    return r;
}
primitive['lattice'] = true;

function to_bstr ( l, uarray ) {
    var bstr = '';
    for (var j=0; j<l.nels; j++) {
        bstr += uarray[j]+'-';
    }
    return bstr;
}

Lattice.add = function (l, elem, subelems) {
    var bits = new Uint32Array(l.nels);
    var shift = l.n, w = 0;
    for (; shift>=32; shift-=32) { w++; }
    bits[w] |= 1 << shift;
    if ( subelems ) {
        for (var i = 0; i<subelems.length; i++) {
            var toor = l.bits[subelems[i]];
            for (var j=0; j<l.nels; j++) {
                bits[j] |= toor[j];
            }
        }
    }
    l.n++;
    l.bits[elem] = bits;
    l.elem[to_bstr(l, bits)] = elem;
}

Lattice.element = function ( lattice, elem ) {
    if (typeof lattice !== 'object') {
        lattice = lattices[lattice];
    }
    return {
        borjes: 'latticeel',
        l: lattice.name,
        e: elem
    };
}
primitive['latticeel'] = true;

Lattice.meet = function (x, y) {
    if (x.l !== y.l) { return Nothing; }
    var l = lattices[x.l];
    var bits = new Uint32Array(l.nels);
    var xbits = l.bits[x.e];
    var ybits = l.bits[y.e];
    for (var i = 0; i<l.nels; i++) {
        bits[i] = xbits[i] & ybits[i];
    }
    var meet = l.elem[to_bstr(l, bits)];
    if (meet === undefined) { return Nothing; }
    return Lattice.element(l, meet);
}

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

// TYPED FEATURE STRUCTURE

function TFS ( type, object, features ) {
    var fs = FStruct(object, features);
    fs.borjes = 'tfstruct';
    fs.type = type;
    return fs;
}

function compare_tfs ( x, y, wx, wy ) {
    if (!eq(x.type, y.type)) { return false; }
    return compare_fs(x, y, wx, wy);
}

function copy_tfs ( x, map ) {
    var r = copy_fs(x, map);
    r.borjes = 'tfstruct';
    r.type = copy(x.type, map);
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
        var p = pred.params[i];
        if (typeof p !== 'object' || p.borjes !== 'variable') {
            args.push(copy(p, map));
        } else {
            args.push(World.resolve(map.nw, Variable.copy(p, map)));
        }
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
    if (x.borjes === 'latticeel') {
        return x.l === y.l && x.e === y.e;
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
    Lattice: Lattice,
    eq: eq,
    copy: copy,
    compare: compare
};
