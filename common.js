"use strict";

var Nothing = {
    asString: "⊥",
    toString: function () { return "⊥"; }
};

var Anything = {
    asString: "⊤",
    toString: function () { return "⊤"; }
};

function Literal ( string ) {
    this.s = string;
    this.asString = this.toString();
};

Literal.prototype.toString = function () {
    return '"'+this.s+'"';
};

module.exports = {
    Nothing: Nothing,
    Anything: Anything,
    Literal: Literal
};
