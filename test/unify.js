var assert = require('assert');

var types = require('../src/types');
var U = require('../src/unify');

var Nothing = types.Nothing;
var Anything = types.Anything;
var Literal = types.Literal;
var FStruct = types.FStruct;
var World = types.World;
var Variable = types.Variable;
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

/* Variables */

var w1 = World();
var w2 = World();
var bfs1 = FStruct({ cat: noun });
var bfs2 = FStruct({ phon: pepa });
World.bind(w1, bfs1);
World.bind(w2, bfs2);
FStruct.set(bfs1, 'phon', Variable(w1, pepa));
FStruct.set(bfs2, 'cat', Variable(w2, noun));

var bfs12 = U(bfs1, bfs2);

assert(eq(U(Nothing, bfs1), Nothing));
assert(compare(bfs1, fs1));
assert(compare(bfs2, fs2));
assert(compare(bfs12, fs1));
assert(!compare(bfs12, f24));

var rec1 = FStruct();
var rec2 = FStruct();
var wrec2 = World();
FStruct.set(rec1, 'child', FStruct({ var1: pepa, var2: kozu }));
World.bind(wrec2, rec2);
var top = Variable(wrec2);
FStruct.set(rec2, 'child', FStruct({ var2: top }));
FStruct.set(rec2, 'top', top);

var rec12 = U(rec1, rec2);
var topkozu = FStruct({top: kozu});
var toppepa = FStruct({top: pepa});
assert(eq(U(toppepa, rec12), Nothing));
assert(!eq(U(topkozu, rec12), Nothing));
