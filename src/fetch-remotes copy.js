const { URL } = require("url");
const http = require("http");
const fs = require("fs");

/**
 * Download remote container bundles
 * @param {{
 *  name: string,
 *  url: string,
 *  path: string
 * }[]} remoteEntry `name` of app, `url` of remote entry, download file to `path`
 *
 * @returns {Promise<{[index: string]: string}>} local paths to downloaded entries
 */
module.exports = async remoteEntry => {
  console.log(remoteEntry);
  const entries = Array.isArray(remoteEntry) ? remoteEntry : [remoteEntry];

  const getPath = entry => {
    const url = new URL(entry.url);
    const path = [
      url.pathname.replace(".js", ""),
      url.hostname.replace(".", "-"),
      url.port,
      entry.name.concat(".js"),
    ].join("-");

    return entry.path.concat(path);
  };

  const remotes = await Promise.all(
    entries.map(async entry => {
      const path = getPath(entry);
      console.log(path);

      return new Promise(resolve => {
        const rslv = () => resolve({ [entry.name]: path });

        const req = http.request(entry.url, res => {
          res.on("error", rslv);
          if (res.statusCode < 200 || res.statusCode >= 300) {
            return rslv();
          }
          res.pipe(fs.createWriteStream(path));

          res.on("end", rslv);
        });

        req.on("error", rslv);
        req.end();
      });
    })
  ).catch(() => {
    return entries.map(entry => ({
      [entry.name]: getPath(entry),
    }));
  });

  return remotes.reduce((p, c) => ({ ...c, ...p }));
};
