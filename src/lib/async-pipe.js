
/**
 * Compose async functions
 * @param {...Function} fns 
 */
const asyncPipe = (...fns) => x => fns.reduce((y, f) => y.then(f), Promise.resolve(x));

module.exports = asyncPipe;