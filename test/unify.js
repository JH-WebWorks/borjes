var assert = require('assert');

var types = require('../src/types');
var unify = require('../src/unify');

function U (x, y) {
    var u = unify(x, y);
    if (u.length!==undefined) {
        for (var i = 0; i<u.length; i++) {
            delete u[i].ux;
        }
    } else {
        delete u.ux;
    }
    return u;
}

var Nothing = types.Nothing;
var Anything = types.Anything;
var Literal = types.Literal;
var FStruct = types.FStruct;
var World = types.World;
var Variable = types.Variable;
var List = types.List;
var Lattice = types.Lattice;
var Disjunct = types.Disjunct;
var Set = types.Set;
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

/* Lattices */

var l = Lattice.fromProto({
    f: {
        a: null,
        c: {
            a: null,
            b: null
        }
    },
    e: {
        b: null,
        d: null
    }
});

var els = {};
['a', 'b', 'c', 'd', 'e', 'f'].forEach(function (e) {
    els[e] = Lattice.element(l, e);
});

assert(eq(U(els.c, els.e), els.b));
assert(eq(U(els.f, els.e), els.b));
assert(eq(U(els.a, els.e), Nothing));
assert(eq(U(els.f, els.c), els.c));
assert(eq(U(els.e, els.d), els.d));
assert(eq(U(els.f, els.d), Nothing));
assert(eq(U(els.a, els.d), Nothing));

/* Lists */
var empty = List();
var empty2 = List();
var l_cf = List(els.c, List(els.f));
var l_ec = List(els.e, List(els.c));
var l_bc = List(els.b, List(els.c));
var l_cd = List(els.c, List(els.d));
var l_cfe = List(els.c, List(els.f, List(els.e)));

var l_world = World();
var l_var_cf = List(els.c, Variable(l_world, List(els.f)));
World.bind(l_world, l_var_cf);

assert(eq(empty, empty2));
assert(eq(U(empty, empty2), empty));
assert(eq(U(l_cf, empty), Nothing));
assert(compare(U(l_cf, l_ec), l_bc));
assert(eq(U(l_cf, l_cd), Nothing));
assert(eq(U(l_cf, l_cfe), Nothing));

assert(compare(U(l_var_cf, l_ec), l_bc));
assert(eq(U(l_var_cf, l_cd), Nothing));

/* Disjuncts */
var e_o_f = Disjunct(els.e, els.f);
var a_o_b = Disjunct(els.a, els.b);

assert(eq(U(e_o_f, els.d), els.d));
var res_d1 = U(a_o_b, e_o_f);
assert(eq(res_d1[0], els.a));
assert(eq(res_d1[1], els.b));
assert(eq(res_d1[2], els.b));

var nested = Disjunct(pepa, Disjunct(pepa2, kozu));
assert(eq(U(nested, kozu), kozu));
var res_d2 = U(nested, pepa);
assert(eq(res_d2[0], pepa));
assert(eq(res_d2[0], pepa2));
assert(eq(res_d2[1], pepa2));

var discworld = World();
var discvars = Disjunct(els.e, Variable(discworld, els.f));
World.bind(discworld, discvars);
var res_d3 = U(discvars, els.a);
assert(eq(World.resolve(res_d3.borjes_bound, res_d3), els.a));

var disjworld = World();
var disjvars = FStruct({ v: Variable(disjworld) });
World.bind(disjworld, disjvars);
var res_d4 = U(disjvars, FStruct({ v: nested }));
assert(res_d4.length === 3);
assert(compare(res_d4[0], FStruct({ v: pepa })));
assert(compare(res_d4[2], FStruct({ v: kozu })));
var res_d5 = U(disjvars, FStruct({ v: e_o_f }));
assert(res_d5.length === 2);
assert(compare(res_d5[0], FStruct({ v: els.e })));
assert(compare(res_d5[1], FStruct({ v: els.f })));

/* Sets */
var set1 = Set(els.a, els.c, els.d);

var setworld = World();
var dsum = Set.sum(Variable(setworld, els.e), Variable(setworld));
World.bind(setworld, dsum);
var res_s1 = U(set1, dsum);

assert(res_s1.length === 2);
assert(compare(World.resolve(res_s1[0].borjes_bound, res_s1[0].el), els.b) ||
       compare(World.resolve(res_s1[1].borjes_bound, res_s1[1].el), els.b));
assert(compare(World.resolve(res_s1[0].borjes_bound, res_s1[0].el), els.d) ||
       compare(World.resolve(res_s1[1].borjes_bound, res_s1[1].el), els.d));

var setw2 = World();
var dsum2 = Set.sum(els.e, Variable(setw2));
World.bind(setw2, dsum2);
var nested = Disjunct(Set(els.a, els.d), Set(els.c));
var res_s2 = U(dsum2, nested);

assert(res_s2.length === 2);
assert(compare(res_s2[0].el, els.d));
assert(compare(res_s2[1].el, els.b));
