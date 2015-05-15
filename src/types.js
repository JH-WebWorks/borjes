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

function compare_fs ( x, y ) {
    for (var i in x.f) {
        var f = x.f[i];
        if (y.v[f]!==undefined && !compare(x.v[f], y.v[f])) {
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

function Variable ( index ) {
    return {
        borjes: 'variable',
        index: index!==undefined?index:-1
    };
}

Variable.new = function ( world, value ) {
    var i = World.put(world, value);
    return Variable(i);
};

function copy_variable ( x, map ) {
    return {
        borjes: 'variable',
        index: x.index>=0?map[x.index]:-1
    };
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
        c = copy_variable(x, map);
    }
    if (x.borjes_bound !== undefined) {
        World.bind(copy(x.borjes_bound, map), c);
    }
    return c;
}

function compare ( x, y ) {
    if (x.borjes !== y.borjes) {
        return false;
    }
    if (primitive[x.borjes]) {
        return eq(x, y);
    }
    if (x.borjes === 'fstruct') {
        return compare_fs(x, y);
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
    eq: eq,
    copy: copy,
    compare: compare
};
