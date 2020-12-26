"use strict"
var sym = Symbol('sym')

const savedModel = {a:'a', [sym]: 'symbol'};

Object.freeze(savedModel)



let writable = {};
    for (let [v, k] of Object.entries(savedModel)) {
      Object.defineProperty(writable, v, {
        writable: true,
        enumerable: true,
        configurable: true
      });
    }

//savedModel.a = 1
writable.a = 1
savedModel[sym]=1
console.log(savedModel)
console.log(writable)
console.log({...savedModel, ...writable});
