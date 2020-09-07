const { URL } = require('url');
const http = require('http');
const fs = require('fs');

/**
 * Download remote container entries
 * @param {{name: string, url: string, path: string}[]} remoteEntry `url` - to remote container, `path` - local path to download to
 * @returns {Promise<{name: string, name2: string}>} local path to downloaded entry
 */
module.exports = (remoteEntry) => {
  console.log(remoteEntry);
  const entries = Array.isArray(remoteEntry)
    ? remoteEntry
    : [remoteEntry];

  return Promise.all(entries.map(entry => {
    var _url = new URL(entry.url);
    var _path = [
      _url.pathname.replace('.', '_'),
      _url.hostname,
      _url.port,
      entry.name,
      '.js'
    ].join('_');
    _path = entry.path.concat(_path);
    console.log(_path);

    return new Promise(function (resolve, reject) {
      var req = http.request(_url, function (res) {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          return reject(new Error('statusCode=' + res.statusCode));
        }
        res.pipe(fs.createWriteStream(_path));
        res.on('end', function () {
          resolve({
            [entry.name]: _path,
          });
        });
      });
      req.on('error', function (err) {
        reject(err);
      });
      req.end();
    });
  })).then(rmts => rmts.reduce((p, c) => ({ ...c, ...p })));
}
