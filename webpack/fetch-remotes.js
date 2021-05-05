const { Octokit } = require("@octokit/rest");
const fs = require("fs");
const path = require("path");
const token = process.env.GITHUB_TOKEN;

function getOptions(entry) {
  const url = new URL(entry.url);
  return {
    hostname: url.hostname,
    pathname: url.pathname,
    port: url.port,
    protocol: url.protocol,
    rejectUnauthorized: false,
  };
}

const octokit = new Octokit({ auth: token });

async function githubFetch(entry, path) {
  return octokit
    .request("GET {url}", {
      url: entry.url.replace("https://github.com", ""),
    })
    .then(function (rest) {
      const file = rest.data.find(f => f.name === "remoteEntry.js");
      return file.sha;
    })
    .then(function (sha) {
      console.log(sha);
      const dir = entry.url.split("/");
      return octokit.request("GET /repos/{owner}/{repo}/git/blobs/{sha}", {
        owner: dir[4],
        repo: dir[5],
        sha: sha,
      });
    })
    .then(function (rest) {
      fs.writeFileSync(
        path,
        Buffer.from(rest.data.content, "base64").toString("utf-8")
      );
    });
}

function httpGet(entry, path, done) {
  const options = getOptions(entry);
  const req = require(options.protocol).request(options, function (res) {
    if (res.statusCode < 200 || res.statusCode >= 300) {
      return console.error("server returned error or redirect");
    }
    res.on("end", done);
    res.pipe(fs.createWriteStream(path));
  });
  req.on("error", () => console.error(error));
}

function dedupEntries(entries) {
  return entries
    .map(function (e) {
      const dupName = new URL(e.url).hostname.concat(e.path);
      return {
        [dupName]: {
          ...e,
          name: dupName,
        },
      };
    })
    .reduce((p, c) => ({ ...p, ...c }));
}

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

  function getPath(entry) {
    const url = new URL(entry.url);
    const filename = [
      url.hostname.replaceAll(".", "-"),
      url.pathname.replaceAll("/", "-").replace("-", ""),
      "remoteEntry.js",
    ].join("-");

    let basedir = entry.path;
    if (entry.path.charAt(entry.path.length - 1) !== "/") {
      basedir = entry.path.concat("/");
    }
    return basedir.concat(filename);
  }

  const uniqueEntries = dedupEntries(entries);

  const remotes = await Promise.all(
    Object.values(uniqueEntries).map(function (entry) {
      const path = getPath(entry);
      console.log("unique entry", path);

      return new Promise(async function (resolve) {
        const resolvePath = () => resolve({ [entry.name]: path });

        if (/^http.*github/i.test(entry.url)) {
          await githubFetch(entry, path);
          resolvePath();
        } else {
          httpGet(entry, path, resolvePath);
        }
      });
    })
  );

  const updatedEntries = entries.map(function (e) {
    const commonName = new URL(e.url).hostname.concat(e.path);
    return {
      [e.name]: remotes.find(r => r[commonName])[commonName],
    };
  });

  return updatedEntries;
};
