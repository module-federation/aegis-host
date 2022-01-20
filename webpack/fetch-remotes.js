'use strict'

const { Octokit } = require('@octokit/rest')
const fs = require('fs')
const path = require('path')
const { RemoteEntriesUtil } = require('./remote-entries-util')

// Use developer token for github api
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN })

/**
 * Download remote entry from github. Will be a blob (> 1MB).
 * File is base64 encoded. Decode to utf-8 and write to `path`.
 *
 * @param {*} entry remote entry record
 * @param {*} path where to write file contents
 * @returns
 */
async function octoGet (entry, path) {
  return octokit
    .request(
      'GET https://api.github.com/repos/{owner}/{repo}/contents/{filedir}?ref={branch}',
      {
        owner: entry.owner,
        repo: entry.repo,
        filedir: entry.filedir,
        branch: entry.branch
      }
    )
    .then(function (rest) {
      const file = rest.data.find(f => f.name === 'remoteEntry.js')
      return file.sha
    })
    .then(function (sha) {
      return octokit.request('GET /repos/{owner}/{repo}/git/blobs/{sha}', {
        owner: entry.owner,
        repo: entry.repo,
        sha
      })
    })
    .then(function (rest) {
      fs.writeFileSync(
        path,
        Buffer.from(rest.data.content, 'base64').toString('utf-8')
      )
    })
}

function httpGet (entry, path, done) {
  const url = new URL(entry.url)
  require(url.protocol.replace(':', '')).get(
    entry.url,
    { rejectUnauthorized: false },
    function (response) {
      response.pipe(fs.createWriteStream(path))
      response.on('end', done)
    }
  )
}

/**
 * Allow multiple entry points from different owners, repos, etc on github.
 * @param {*} entry
 * @param {*} url
 * @returns
 */
function generatePath (entry, url) {
  if (entry.owner)
    return `${entry.owner}-${entry.repo}-${entry.filedir
      .split('/')
      .join('-')}-${entry.branch}`
  return url.pathname.split('/').join('-')
}

function generateFilename (entry) {
  const url = new URL(entry.url)
  const hostpart = url.hostname.split('.').join('-')
  const portpart = url.port ? url.port : 80
  const pathpart = generatePath(entry, url)
  if (/remoteEntry/i.test(pathpart))
    return `${hostpart}-${portpart}-${pathpart}`
  return `${hostpart}-${portpart}-${pathpart}-remoteEntry.js`
}

function getPath (entry) {
  var entry
  if (!entry || !entry.path) {
    entry.path = path.join(process.cwd(), 'webpack')
  }
  console.debug(getPath.name, entry)
  const filename = generateFilename(entry)
  let basedir = entry.path
  if (entry.path && entry.path.charAt(entry.path.length - 1) !== '/') {
    basedir = entry.path.concat('/')
  }
  return basedir.concat(filename)
}

/**
 * If streaming from github, owner, repo etc contribute to uniqueness.
 * @param {*} entry
 * @returns
 */
function uniqueUrl (entry) {
  return `${entry.url}${entry.owner}${entry.repo}${entry.filedir}${entry.branch}`
}

function deduplicate (remoteEntries) {
  if (!remoteEntries || remoteEntries.length < 1) return {}
  return remoteEntries
    .map(function (e) {
      return {
        [uniqueUrl(e)]: {
          ...e,
          name: uniqueUrl(e)
        }
      }
    })
    .reduce((p, c) => ({ ...p, ...c }), remoteEntries)
}

/**
 * Download each unique remote entry file.
 * @param {{
 *  name: string,
 *  url: string,
 *  path: string
 * }[]} remoteEntries `name` of file, `url` of file, download file to `path`
 *
 * @returns {Promise<{[index: string]: string}>} local paths to downloaded entries
 */
module.exports = async remoteEntries => {
  const entries = RemoteEntriesUtil(remoteEntries)
    .validateEntries()
    .removeWasmEntries()
    .entries()

  console.log(entries)
  const remotes = await Promise.all(
    Object.values(deduplicate(entries)).map(function (entry) {
      const path = getPath(entry)
      console.log('downloading file to', path)

      return new Promise(async function (resolve) {
        const resolvePath = () => resolve({ [entry.name]: path })

        if (/^https:\/\/api.github.com.*/i.test(entry.url)) {
          // Download from github.
          await octoGet(entry, path)
          resolvePath()
        } else {
          httpGet(entry, path, resolvePath)
        }
      })
    })
  )

  return entries.map(e => ({
    [e.name]: remotes.find(r => r[uniqueUrl(e)])[uniqueUrl(e)]
  }))
}
