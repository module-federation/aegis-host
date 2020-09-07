const { URL } = require('url');
const http = require('http');
const fs = require('fs');

/**
 * Download remote container entries
 * @param {{url: string, path: string}[]} remoteEntry `url` - to remote container, `path` - local path to download to
 * @returns {Promise<string>} local path to downloaded entry
 */
module.exports = (remoteEntry) => {
  console.log(remoteEntry);

  let entries = [];
  if (Array.isArray(remoteEntry)) {
    entries = remoteEntry;
  } else {
    entries.push(remoteEntry);
  }

  return Promise.all(entries.map(entry => {
    var _url = new URL(entry.url);

    var _path = [
      _url.pathname.replace('.', '_'),
      _url.hostname,
      _url.port,
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
          resolve(_path);
        });
      });
      req.on('error', function (err) {
        reject(err);
      });
      req.end();
    });
  }));
}
