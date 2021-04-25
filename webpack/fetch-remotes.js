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

function githubFetch(entry) {
  octokit
    .request("GET /repos/{owner}/{repo}/contents/{path}?ref=oldstyle-stream", {
      owner: "module-federation",
      repo: "MicroLib-Example",
      path: "dist",
    })
    .then(function (rest) {
      const file = rest.data.find(d => d.name === "remoteEntry.js");
      return file.sha;
    })
    .then(function (sha) {
      console.log(sha);
      return octokit.request("GET /repos/{owner}/{repo}/git/blobs/{sha}", {
        owner: "module-federation",
        repo: "MicroLib-Example",
        sha: sha,
      });
    })
    .then(function (rest) {
      fs.writeFileSync(
        path.resolve(entry.path, "remoteEntry.js"),
        Buffer.from(rest.data.content, "base64").toString("utf-8")
      );
    });
}

function httpGet(entry) {
  const options = getOptions(entry);
  const req = require(options.protocol).request(options, function (res) {
    if (res.statusCode < 200 || res.statusCode >= 300) {
      return console.error("server returned error or redirect");
    }
    res.pipe(fs.createWriteStream(path));
  });
  req.on("error", () => console.error(error));
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
    // const url = new URL(entry.url);
    // const path = [
    //   url.pathname.replace(".js", ""),
    //   url.hostname.replace(".", "-"),
    //   url.port,
    //   entry.name.concat(".js"),
    // ].join("-");

    return entry.path.concat("/remoteEntry.js");
  }

  const remotes = await Promise.all(
    entries.map(async entry => {
      const path = getPath(entry);
      console.log(path);

      return new Promise(resolve => {
        if (entry.url.startsWith("https://github")) {
          githubFetch(entry);
        } else {
          httpGet(entry);
        }
        resolve({ [entry.name]: path });
      });
    })
  );
  return remotes.reduce((p, c) => ({ ...c, ...p }));
};
