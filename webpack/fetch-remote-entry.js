const { URL } = require('url');
const http = require('http');
const fs = require('fs');
const e = require('express');

/**
 * Download remote container bundles
 * @param {{name: string, url: string, path: string}[]} remoteEntry `name` of app, `url` of remote entry, download file to `path` 
 * @returns {Promise<{[index: string]: string}>} local paths to downloaded entries
 */
module.exports = async (remoteEntry) => {
  console.log(remoteEntry);
  //TODO: call container registry to get remote entries
  var entries = Array.isArray(remoteEntry)
    ? remoteEntry
    : [remoteEntry];

  var getPath = (entry) => {
    var url = new URL(entry.url);
    var path = [
      url.pathname.replace('.js', ''),
      url.hostname.replace('.', '-'),
      url.port,
      entry.name.concat('.js')
    ].join('-');

    return entry.path.concat(path);
  }

  const remotes = await Promise.all(entries.map(entry => {
    var path = getPath(entry);
    console.log(path);

    return new Promise((resolve, reject) => {
      var req = http.request(entry.url, (res) => {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          return reject({ [entry.name]: path });
        }
        res.pipe(fs.createWriteStream(path));
        res.on('end', () => {
          resolve({ [entry.name]: path });
        });
      });
      req.on('error', (err) => {
        reject({ [entry.name]: path });
      });
      req.end();
    }).catch(() => ({
      [entry.name]: path
    }));
  })).catch(() => {
    var remotes = remoteEntry.map(entry => ({
      [entry.name]: getPath(entry)
    }));
    return Promise.resolve(remotes);
  });

  return remotes.reduce((p, c) => ({ ...c, ...p }));
}
