const { Octokit } = require("@octokit/rest");

const octokit = new Octokit();

// Compare: https://docs.github.com/en/rest/reference/repos/#list-organization-repositories
octokit
  .request("GET /repos/{owner}/{repo}", {
    owner: "module-federation",
    repo: "MicroLib-Example",
  })
  .then(data => console.log(data));
