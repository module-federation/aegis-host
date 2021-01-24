"use strict";

class ImmutableArray extends Array {
  constructor(...args) {
    super(...args);
  }

  push(element) {
    return new ImmutableArray(...[...this, element]);
  }

  last() {
    return this[this.length - 1];
  }

  pop(verbose = false) {
    const last = this.last();

    if (verbose) {
      return {
        last,
        array: this.slice(0, this.length - 1),
      };
    }

    return last;
  }
}

var a = new ImmutableArray(1, 2, 3);
var b = a.push(4);
var c = b.push(5);
var d = c.pop(true).array;
console.log({ a, b, c, d, last: d.last() });
console.log(c.concat([6, 7]));
console.log(d.pop());
