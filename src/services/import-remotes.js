import remoteEntries from '../../webpack/remote-entries';

/**
 *
 */
export async function importRemoteModels () {
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


export async function importRemoteServices() {
  const importStartTime = Date.now();

  let services = [];
  for (const entry of remoteEntries) {
    if (entry.type === 'service') {
      const service = await entry.importRemote();
      services.push(service);
    }
  }

  console.log("\n%dms to import remote services\n",
    Date.now() - importStartTime);

  return services.reduce((p, c) => ({...c, ...p}));
}