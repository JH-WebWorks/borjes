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

function FStruct ( object, features ) {
    if (object === undefined) {
        features = [];
    }
    var r = {
        borjes: 'fstruct',
        f: features || Object.keys(object),
        v: {},
    };
    for (var i in r.f) {
        var f = r.f[i];
        r.v[f] = copy(object[f]);
    }
    return r;
}
primitive['fstruct'] = false;

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

function copy ( x ) {
    if (primitive[x.borjes]) {
        return x;
    }
    if (x.borjes === 'fstruct') {
        return FStruct(x.v);
    }
}

module.exports = {
    Nothing: Nothing,
    Anything: Anything,
    Literal: Literal,
    FStruct: FStruct,
    eq: eq,
    copy: copy
};
