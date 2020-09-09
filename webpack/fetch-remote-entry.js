const { URL } = require('url');
const http = require('http');
const fs = require('fs');

/**
 * Download remote container bundles
 * @param {{name: string, url: string, path: string}[]} remoteEntry `name` of app, `url` of remote entry, download file to `path` 
 * @returns {Promise<{[index: string]: string}>} local paths to downloaded entries
 */
module.exports = async (remoteEntry) => {
  console.log(remoteEntry);
  const entries = Array.isArray(remoteEntry)
    ? remoteEntry
    : [remoteEntry];

  const remotes = await Promise.all(entries.map(entry => {
    var url = new URL(entry.url);
    var path = [
      url.pathname.replace('.js', ''),
      url.hostname.replace('.', '-'),
      url.port,
      entry.name.concat('.js')
    ].join('-');

    path = entry.path.concat(path);
    console.log(path);

    return new Promise((resolve, reject) => {
      var req = http.request(url, (res) => {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          return reject(new Error('statusCode=' + res.statusCode));
        }
        res.pipe(fs.createWriteStream(path));
        res.on('end', () => {
          resolve({ [entry.name]: path });
        });
      });
      req.on('error', (err) => {
        reject(err);
      });
      req.end();
    });
  }));

  return remotes.reduce((p, c) => ({ ...c, ...p }));
}
