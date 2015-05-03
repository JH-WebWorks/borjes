"use strict";

function Tree (node, children) {
    this.node = node;
    this.children = [].concat(children);
}

Tree.prototype.add_children = function (children) {
    this.c = this.c.concat(children);
};

module.exports = Tree;
