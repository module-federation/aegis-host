"use strict";

const { Octokit } = require("@octokit/rest");
const fs = require("fs");
const token = process.env.GITHUB_TOKEN;

function githubPath(entry, url) {
  if (entry.owner)
    return `${entry.owner}-${entry.repo}-${entry.filedir.split("/").join("-")}`;
  return url.pathname.split("/").join("-");
}

function generateFilename(entry) {
  const url = new URL(entry.url);
  const hostpart = url.hostname.split(".").join("-");
  const portpart = url.port ? url.port : 80;
  const pathpart = githubPath(entry, url);
  if (/remoteEntry/i.test(pathpart))
    return `${hostpart}-${portpart}-${pathpart}`;
  return `${hostpart}-${portpart}-${pathpart}-remoteEntry.js`;
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
    .request(
      "GET https://api.github.com/repos/{owner}/{repo}/contents/{filedir}?ref={branch}",
      {
        owner: entry.owner,
        repo: entry.repo,
        filedir: entry.filedir,
        branch: entry.branch,
      }
    )
    .then(function (rest) {
      const file = rest.data.find(f => f.name === "remoteEntry.js");
      return file.sha;
    })
    .then(function (sha) {
      return octokit.request("GET /repos/{owner}/{repo}/git/blobs/{sha}", {
        owner: entry.owner,
        repo: entry.repo,
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

function getUniqueEntry(entry) {
  return `${entry.url}${entry.owner}${entry.repo}${entry.filedir}`;
}

/**
 * Return each unique url just once
 * @param {{name:string,path:sting,filedir:string,branch:string,url:string}[]} entries
 * @returns {{[x:string]:{name:string,path:string,url:string}}}
 */
function deduplicate(entries) {
  return entries
    .map(function (e) {
      return {
        [getUniqueEntry(e)]: {
          ...e,
          name: getUniqueEntry(e),
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
    Object.values(deduplicate(entries)).map(function (entry) {
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

  return entries.map(e => ({
    [e.name]: remotes.find(r => r[getUniqueEntry(e)])[getUniqueEntry(e)],
  }));
};
