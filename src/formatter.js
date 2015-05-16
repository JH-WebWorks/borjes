"use strict";

var types = require('./types');

var FStruct = types.FStruct;
var World = types.World;

function primitive (object) {
    if (typeof object !== 'object') {
        return object+'';
    }
    if (object.borjes == 'literal') {
        return object.s;
    }
    return '<unknown>';
}
exports.primitive = primitive;

function flist (object, main) {
    if (typeof object !== 'object' || object.borjes !== 'fstruct') {
        return primitive(object);
    }
    var w = object.borjes_bound;
    var r = primitive(World.resolve(w, FStruct.get(object, main)));
    var fs = object.f.sort();
    var i;
    for (i=0; i<fs.length; i++) {
        var f = fs[i];
        if (f===main) { continue; }
        if (i==0) { r+='('; }
        else { r+=','; }
        var v = World.resolve(w, FStruct.get(object, f));
        r+=flist(v, main);
    }
    if (i>1) { r+=')'; }
    return r;
}
exports.flist = flist;
