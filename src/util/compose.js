'use strict'

/**
 * Execute functions in right-to-left order
 * ```
 * compose(func1, func2)(ObjectToCompose);
 * // equivalent to 
 * func1(func2(ObjectToCompose));
 * ```
 * @param {...Function} funcs - functions to execute
 */
export default function compose(...funcs) {
  return function (initVal) {
    return funcs.reduceRight(function (val, func) {
      return func(val);
    }, initVal);
  }
}







/*
function increment(num) {
  const sum = num + 1;
  console.log(`increment: ${sum}`);
  return sum;
}

function decrement(num) {
  const diff = num - 1;
  console.log(`decrement: ${diff}`);
  return diff;
}

console.log(compose(increment, decrement)(1));

const incrementDecrement = compose(
  increment,
  increment,
  decrement
);

console.log(incrementDecrement(1));


*/