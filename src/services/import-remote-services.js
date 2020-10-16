import remoteEntries from '../../webpack/remote-entries';

export async function importRemoteServices() {
  let services = [];
  for (const entry of remoteEntries) {
    if (entry.type === 'service') {
      const service = await entry.importRemote();
      services.push(service);
    }
  }
  return services.reduce((p, c) => ({...c, ...p}));

}