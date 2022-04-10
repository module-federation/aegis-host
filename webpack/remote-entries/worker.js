/**
 * @typedef {import("../remote-entries-type").remoteEntry} entries
 */

/**
 * This creates a model that is controlled by a custom worker
 * instead of the system default worker. Developers do whatever
 * they want with the worker and needn't use the associated model.
 *
 * @type {entries[]}
 */
exports.worker = [
  {
    name: 'worker',
    url: 'https://api.github.com',
    repo: 'aegis',
    owner: 'module-federation',
    filedir: 'dist',
    branch: 'worker',
    path: __dirname,
    type: 'model',
    worker: 'worker.js',
    importRemote () {
      return import('workers/examples/simple')
    }
  }
]
