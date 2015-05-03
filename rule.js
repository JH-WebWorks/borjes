"use strict";

var types = require('./common');
var unify = require('./unify');

var Nothing = types.Nothing;

function Rule ( mother, daughters, name, events ) {
    this.d = daughters;
    this.m = mother;
    this.name = name || "Rule for "+mother;
    this.on = events || {};
    this.arity = daughters.length;
}

Rule.prototype.toString = function () {
    return this.name;
};

Rule.prototype.apply = function ( xs ) {
    if (xs.length != this.d.length) {
        if (!!this.on.fail) { this.on.fail(this, xs, -1); }
        return Nothing;
    }
    for (var i=0; i<xs.length; i++) {
        var u = unify(xs[i], this.d[i]);
        if (u === Nothing) {
            if (!!this.on.fail) { this.on.fail(this, xs, i); }
            return Nothing;
        }
    }
    if (!!this.on.success) { this.on.success(this, xs); }
    return this.m;
};

module.exports = Rule;
