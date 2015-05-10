var assert = require('assert');

var types = require('../src/types');
var U = require('../src/unify');

var Nothing = types.Nothing;
var Anything = types.Anything;
var Literal = types.Literal;
var FStruct = types.FStruct;
var eq = types.eq;
var compare = types.compare;

/* Nothing */

assert(eq(U(Nothing, Nothing), Nothing));
assert(eq(U(Nothing, Anything), Nothing));
assert(eq(U(Anything, Nothing), Nothing));
assert(eq(U(Anything, Anything), Anything));

/* Literals */

var pepa = Literal("pepa");
var pepa2 = Literal("pepa");
var kozu = Literal("kozu");

assert(eq(U(Nothing, pepa), Nothing));
assert(eq(pepa, pepa2));
assert(!eq(pepa, kozu));
assert(eq(U(pepa, kozu), Nothing));
assert(eq(U(kozu, pepa), Nothing));
assert(eq(U(pepa, pepa), pepa));
assert(eq(U(pepa, pepa), pepa2));
assert(eq(U(pepa, pepa2), pepa));

/* FS's */

var noun = Literal('noun');
var fs1 = FStruct({ cat: noun, phon: pepa });
var fs2 = FStruct({ cat: noun });
var fs3 = FStruct({ phon: pepa });
var fs4 = FStruct({ phon: kozu });

var f12 = U(fs1, fs2);
var f13 = U(fs1, fs3);
var f14 = U(fs1, fs4);
var f23 = U(fs2, fs3);
var f24 = U(fs2, fs4);
var f34 = U(fs3, fs4);

assert(eq(U(Nothing, fs1), Nothing));
assert(compare(f12, fs1));
assert(!compare(f12, fs4));
assert(compare(f13, fs1));
assert(eq(f14, Nothing));
assert(compare(f23, fs1));
assert(!compare(f23, f24));
assert(!compare(f24, f12));
assert(eq(f34, Nothing));
assert(eq(U(f12, f24), Nothing));
