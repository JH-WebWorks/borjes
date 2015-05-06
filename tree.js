"use strict";

function Tree (node, children) {
    this.node = node;
    if (!!children) {
        this.children = [].concat(children);
    } else {
        this.children = [];
    }
}

Tree.prototype.add_children = function (children) {
    this.c = this.c.concat(children);
};

module.exports = Tree;
