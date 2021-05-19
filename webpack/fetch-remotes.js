"use strict";

const { Octokit } = require("@octokit/rest");
const fs = require("fs");
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

/**
 * Download remote entry from github. Will be a blob (> 1MB).
 * File is base64 encoded. Decode to utf-8 and write to `path`.
 *
 * @param {*} entry remote entry record
 * @param {*} path where to write file contents
 * @returns
 */
async function githubFetch(entry, path) {
  return octokit
    .request("GET {url}", {
      url: entry.url,
    })
    .then(function (rest) {
      const file = rest.data.find(f => f.name === "remoteEntry.js");
      return file.sha;
    })
    .then(function (sha) {
      const [, , , , owner, repo] = entry.url.split("/");
      return octokit.request("GET /repos/{owner}/{repo}/git/blobs/{sha}", {
        owner,
        repo,
        sha,
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

function getPath(entry) {
  const url = new URL(entry.url);
  const filename = [
    url.hostname.split(".").join("-"),
    url.pathname.split("/").join("-"),
    "remoteEntry.js",
  ].join("-");

  let basedir = entry.path;
  if (entry.path.charAt(entry.path.length - 1) !== "/") {
    basedir = entry.path.concat("/");
  }
  return basedir.concat(filename);
}

/**
 * Return each unique url just once
 * @param {{name:string,path:sting,url:string}[]} entries
 * @returns {{[x:string]:{name:string,path:string,url:string}}}
 */
function dedupUrls(entries) {
  return entries
    .map(function (e) {
      const commonPath = new URL(e.url).hostname.concat(e.path);
      return {
        [commonPath]: {
          ...e,
          name: commonPath,
        },
      };
    })
    .reduce((p, c) => ({ ...p, ...c }));
}

/**
 * Download each unique remote entry file.
 * @param {{
 *  name: string,
 *  url: string,
 *  path: string
 * }[]} remoteEntry `name` of file, `url` of file, download file to `path`
 *
 * @returns {Promise<{[index: string]: string}>} local paths to downloaded entries
 */
module.exports = async remoteEntry => {
  console.info(remoteEntry);
  const entries = Array.isArray(remoteEntry) ? remoteEntry : [remoteEntry];

  const remotes = await Promise.all(
    Object.values(dedupUrls(entries)).map(function (entry) {
      const path = getPath(entry);
      console.log("downloading file to", path);

      return new Promise(async function (resolve) {
        const resolvePath = () => resolve({ [entry.name]: path });

        if (/^http.*github/i.test(entry.url)) {
          // Download from github.
          await githubFetch(entry, path);
          resolvePath();
        } else {
          httpGet(entry, path, resolvePath);
        }
      });
    })
  );

  return entries.map(function (e) {
    const commonPath = new URL(e.url).hostname.concat(e.path);
    return {
      [e.name]: remotes.find(r => r[commonPath])[commonPath],
    };
  });
};
