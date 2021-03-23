"use strict";

/**
 * @returns {Promise<import('../models').ModelSpecification[]>}
 */
export async function importRemoteModels(remoteEntries) {
  const label = "\ntime to import remote models";
  console.time(label);

  console.log(remoteEntries);

  let remoteModels = [];
  for (const entry of remoteEntries) {
    console.log(entry);
    if (entry.type === "model") {
      console.log(entry);
      const models = await entry.importRemote();
      remoteModels.push(models);
    }
  }

  console.timeEnd(label);

  return remoteModels.reduce((p, c) => ({ ...p, ...c }));
}

/**
 * Imports remote service modules.
 */
export async function importRemoteServices(remoteEntries) {
  const label = "\ntime to import remote services";
  console.time(label);
  console.log(remoteEntries);
  let services = [];
  for (const entry of remoteEntries) {
    console.log(entry);
    if (entry.type === "service") {
      const service = await entry.importRemote();
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
      adapters.push(adapter);
    }
  }

  console.timeEnd(label);

  if (adapters.length === 0) return {};

  return adapters.reduce((p, c) => ({ ...p, ...c }));
}
