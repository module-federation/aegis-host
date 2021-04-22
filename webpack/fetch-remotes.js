const { URL } = require("url");
const fs = require("fs");
//const https = require("follow-redirects").https;
const https = require("https");
const { Octokit } = require("@octokit/rest");

const octokit = new Octokit();

// Compare: https://docs.github.com/en/rest/reference/repos/#list-organization-repositories
octokit
  .request("GET /repos/{owner}/{repo}/git/blobs/{file_sha}", {
    owner: "octocat",
    repo: "hello-world",
    file_sha: "31a832c61a091f54e73a7888b93316f84ec9080e",
  })
  .then(data => console.log(data));
//https://docs.github.com/rest/reference/repos#get-repository-content
// curl \
// -H "Accept: application/vnd.github.raw" \
// https://api.github.com/repos/module-federation/MicroLib/contents/src/index.
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
    const path = [
      url.pathname.replace(".js", ""),
      url.hostname.replace(".", "-"),
      url.port,
      entry.name.concat(".js"),
    ].join("-");

    return entry.path.concat(path);
  }

  function getOptions(entry) {
    const url = new URL(entry.url);
    return {
      hostname: url.hostname,
      pathname: url.pathname,
      port: 443,
      protocol: url.protocol,
      rejectUnauthorized: false,
    };
  }

  const remotes = await Promise.all(
    entries.map(async entry => {
      const path = getPath(entry);
      console.log(path);

      return new Promise(resolve => {
        const rslv = data => {
          console.log(data);
          resolve({ [entry.name]: path });
        };

        // const req = https.request(getOptions(entry), res => {
        const req = octokit
          .request("GET /repos/{owner}/{repo}/git/blobs/{file_sha}", {
            owner: "octocat",
            repo: "hello-world",
            file_sha: "31a832c61a091f54e73a7888b93316f84ec9080e",
          })
          .then(data => {
            console.log(data);

            console.debug({
              url: entry.url,
              options: getOptions(entry),
              reponseHeaders: res.headers,
              statusCode: res.statusCode,
              statusMessage: res.statusMessage,
            });
            if (res.statusCode < 200 || res.statusCode >= 300) {
              return rslv("server returned error or redirect");
            }
            res.pipe(fs.createWriteStream(path));
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
