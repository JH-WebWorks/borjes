"use strict";

var types = require('./common');
var unify = require('./unify');

var Nothing = types.Nothing;

function Principle ( antecedent, consequent, name, events ) {
    this.a = antecedent;
    this.c = consequent;
    this.name = name || "Principle "+antecedent" => "+consequent;
    this.on = events || {};
}

Principle.prototype.toString = function () {
    return this.name;
};

Principle.prototype.apply = function ( x ) {
    var u = unify(this.a, x);
    if (u === Nothing) {
        if (!!this.on.false_antecedent) { this.on.false_antecedent(this, x); }
        else if (!!this.on.success) { this.on.success(this, x); }
        return x;
    }
    var r = unify(u, this.c);
    if (r === Nothing && !!this.on.fail) { this.on.fail(this, x); }
    if (r !== Nothing && !!this.on.success) { this.on.success(this, x); }
    return r;
};

module.exports = Principle;
