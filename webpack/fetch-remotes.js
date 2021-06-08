"use strict";

const { Octokit } = require("@octokit/rest");
const fs = require("fs");
const token = process.env.GITHUB_TOKEN;

function generateFilename(entry) {
  const url = new URL(entry.url);
  const hostpart = url.hostname.split(".").join("-");
  const pathpart = url.pathname.split("/").join("-");
  const portpart = url.port ? url.port : 80;
  if (/remoteEntry/i.test(pathpart))
    return `${hostpart}-${portpart}${pathpart}`;
  return `${hostpart}-${portpart}${pathpart}-remoteEntry.js`;
}

function getPath(entry) {
  const filename = generateFilename(entry);
  let basedir = entry.path;
  if (entry.path.charAt(entry.path.length - 1) !== "/") {
    basedir = entry.path.concat("/");
  }
  return basedir.concat(filename);
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
  const url = new URL(entry.url);
  require(url.protocol.replace(":", "")).get(
    entry.url,
    { rejectUnauthorized: false },
    function (response) {
      response.pipe(fs.createWriteStream(path));
      response.on("end", done);
    }
  );
}

/**
 * Return each unique url just once
 * @param {{name:string,path:sting,url:string}[]} entries
 * @returns {{[x:string]:{name:string,path:string,url:string}}}
 */
function deduplicateUrls(entries) {
  return entries
    .map(function (e) {
      return {
        [e.url]: {
          ...e,
          name: e.url,
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
    Object.values(deduplicateUrls(entries)).map(function (entry) {
      const path = getPath(entry);
      console.log("downloading file to", path);

      return new Promise(async function (resolve) {
        const resolvePath = () => resolve({ [entry.name]: path });

        if (/^https:\/\/api.github.com.*/i.test(entry.url)) {
          // Download from github.
          await githubFetch(entry, path);
          resolvePath();
        } else {
          httpGet(entry, path, resolvePath);
        }
      });
    })
  );

  return entries.map(e => ({ [e.name]: remotes.find(r => r[e.url])[e.url] }));
};
