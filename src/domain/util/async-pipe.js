/**
 * Pipe asynchronous functions (executed in left-to-right order)
 * ```
 * await asyncPipe(func1, func2)(obj);
 * // equivalent to
 * obj.then(obj => func1(obj)).then(obj => func2(obj))
 * ```
 * @param {...Function} fns
 */
const asyncPipe = (...fns) => x =>
  fns.reduce((o, f) => o.then(f), Promise.resolve(x));

module.exports = asyncPipe;
