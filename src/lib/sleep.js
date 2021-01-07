/**
 * Sleep for `sec` seconds.
 * @param {number} sec
 */
const sleep = (sec) => new Promise((r) => setTimeout(r, sec * 1000));

export default sleep;
