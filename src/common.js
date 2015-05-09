"use strict";

var Nothing = {
    borjes: 'nothing'
};

var Anything = {
    borjes: 'anything'
};

function Literal ( string ) {
    return {
        borjes: 'literal',
        s: string
    }
};

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
};

module.exports = {
    Nothing: Nothing,
    Anything: Anything,
    Literal: Literal,
    eq: eq
};
