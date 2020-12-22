'use strict';

import remoteEntries from '../../webpack/remote-entries';

/**
 * @returns {Promise<import('../models').ModelSpecification[]>}
 */
export async function importRemoteModels() {
  const importStartTime = Date.now();

  let remoteModels = [];
  for (const entry of remoteEntries) {
    if (entry.type === 'model') {
      const models = await entry.importRemote();
      remoteModels.push(models);
    }
  }

  console.log('\n%dms to import remote models\n', Date.now() - importStartTime);

  return remoteModels
    .map((m) => ({
      ...m,
    }))
    .reduce((p, c) => ({
      ...c,
      ...p,
    }));
}

/**
 * Imports remote service modules.
 */
export async function importRemoteServices() {
  const importStartTime = Date.now();

  let services = [];
  for (const entry of remoteEntries) {
    if (entry.type === 'service') {
      const service = await entry.importRemote();
      services.push(service);
    }
  }

  console.log(
    '\n%dms to import remote services\n',
    Date.now() - importStartTime
  );

  if (services.length === 0) return {};

  return services.reduce((p, c) => ({
    ...c,
    ...p,
  }));
}

export async function importRemoteAdapters() {
  const importStartTime = Date.now();

  let adapters = [];
  for (const entry of remoteEntries) {
    if (entry.type === 'adapter') {
      const adapter = await entry.importRemote();
      adapters.push(adapter);
    }
  }

  console.log(
    '\n%dms to import remote adapters\n',
    Date.now() - importStartTime
  );

  if (adapters.length === 0) return {};

  return adapters.reduce((p, c) => ({
    ...c,
    ...p,
  }));
}
