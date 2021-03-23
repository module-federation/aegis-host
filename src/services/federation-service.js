"use strict";

/**
 * @returns {Promise<import('../models').ModelSpecification[]>}
 */
export async function importRemoteModels(remoteEntries) {
  const label = "\ntime to import remote models";
  console.time(label);

  const remoteModels = [];
  try {
    for (const entry of remoteEntries) {
      if (entry.type === "model") {
        const models = await entry.importRemote();
        console.debug(models);
        remoteModels.push(models);
      }
    }
  } catch (e) {
    console.error(e);
  }

  console.timeEnd(label);

  if (remoteModels.length === 0) return {};

  return remoteModels.reduce((p, c) => ({ ...p, ...c }));
}

/**
 * Imports remote service modules.
 */
export async function importRemoteServices(remoteEntries) {
  const label = "\ntime to import remote services";
  console.time(label);

  let services = [];
  for (const entry of remoteEntries) {
    if (entry.type === "service") {
      const service = await entry.importRemote();
      console.debug(service);
      services.push(service);
    }
  }

  console.timeEnd(label);

  if (services.length === 0) return {};

  return services.reduce((p, c) => ({ ...p, ...c }));
}

export async function importRemoteAdapters(remoteEntries) {
  const label = "\ntime to import remote adapters";
  console.time(label);

  let adapters = [];
  for (const entry of remoteEntries) {
    if (entry.type === "adapter") {
      const adapter = await entry.importRemote();
      console.info(adapter);
      adapters.push(adapter);
    }
  }

  console.timeEnd(label);

  if (adapters.length === 0) return {};

  console.log(adapters);

  return adapters.reduce((p, c) => ({ ...p, ...c }));
}
