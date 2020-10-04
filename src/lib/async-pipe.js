
/**
 * Compose async functions (executed in left-to-right order)
 * @param {...Function} fns 
 */
const asyncPipe = (...fns) => x => fns.reduce((y, f) => y.then(f), Promise.resolve(x));

module.exports = asyncPipe;