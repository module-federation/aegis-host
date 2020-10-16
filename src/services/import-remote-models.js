import remoteEntries from '../../webpack/remote-entries';
/**
 *
 */
export default async () => {
  const importStartTime = Date.now();

  let remoteModels = [];
  for (const entry of remoteEntries) {
    if (entry.type === 'model') {
      const models = await entry.importRemote();
      remoteModels.push(models);
    }
  }

  console.log("\n%dms to import remote models\n",
    Date.now() - importStartTime);

  return remoteModels.map(m => ({ ...m }))
    .reduce((p, c) => ({ ...c, ...p }));
}