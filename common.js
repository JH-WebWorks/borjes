"use strict";

var Nothing = {
    toString: function () { return "⊥"; }
};

var Anything = {
    toString: function () { return "⊤"; }
};

function Literal ( string ) {
    this.s = string;
};

Literal.prototype.toString = function () {
    return '"'+this.s+'"';
};

module.exports = {
    Nothing: Nothing,
    Anything: Anything,
    Literal: Literal
};
