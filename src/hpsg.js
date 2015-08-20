"use strict";

var Borjes = require('./index');
var yaml = require('js-yaml');

var Nothing = Borjes.types.Nothing;
var Literal = Borjes.types.Literal;
var Lattice = Borjes.types.Lattice;

var LiteralYML = new yaml.Type('!l', {
    kind: 'scalar',
    resolve: function (s) { return s !== null; },
    construct: function (s) {
        return Literal(s);
    }
});

var EitherYML = new yaml.Type('!either', {
    kind: 'sequence',
    resolve: function () { return true; },
    construct: function () {
        return Literal("TODO");
    }
});

var BORJES_SCHEMA = new yaml.Schema({
    include: [ yaml.DEFAULT_SAFE_SCHEMA ],
    explicit: [ LiteralYML, EitherYML ]
});

/**
 * Add a signature to a lattice.
 *
 * @param {Lattice} l
 * @param {Object} sig
 */
function loadSignature ( l, sig ) {
    for (var el in sig) {
        if (Lattice.element(l, el) === Nothing) {
            loadSignature(l, sig[el]);
            Lattice.add(l, el, sig[el]?Object.keys(sig[el])
                .map(function (name) {
                    return Lattice.element(l, name);
                }):undefined);
        }
    }
}

/**
 * Loads an HPSG description into a grammar.
 *
 * @param {Grammar} grammar - grammar to extend.
 * @param {String} description - yaml formatted grammar description.
 */
module.exports = function ( grammar, description ) {

    var d = yaml.load(description, { schema: BORJES_SCHEMA });

    for (var section in d) {
        switch (section) {
        case 'Signature':
            if (!grammar.signature) {
                grammar.signature = Lattice();
            }
            loadSignature(grammar.signature, d.Signature);
            break;
        }
    }
}
