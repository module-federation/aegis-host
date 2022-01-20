/**
 *
 * @param {{name:string,path:sting,filedir:string,branch:string,url:string}[]} remoteEntries
 */
exports.RemoteEntriesUtil = function (remoteEntries) {
  console.info(remoteEntries)
  const entries = Object.values(remoteEntries)
    .map(e => Object.values(e))
    .flat(2)

  return {
    validateEntries () {
      if (!entries || entries.length < 1)
        throw new Error('entries missing or invalid')
      return this
    },

    removeWasmEntries () {
      if (Array.isArray(entries))
        entries.forEach((e, i, a) => !e.wasm || a.splice(i, 1))
      return this
    },

    entries () {
      return entries
    }
  }
}
