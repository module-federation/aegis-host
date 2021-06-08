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
        console.info(`streaming from ${entry.url}`);
        const models = await entry.importRemote();
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
      console.info(`streaming from ${entry.url}`);
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
      console.info(`streaming from ${entry.url}`);
      const adapter = await entry.importRemote();
      adapters.push(adapter);
    }
  }

  console.timeEnd(label);

  if (adapters.length === 0) return {};

  return adapters.reduce((p, c) => ({ ...p, ...c }));
}

export async function importModelsCache(remoteEntries, name) {
  const label = "\ntime to import remote models cache";
  console.time(label);

  const remoteModels = [];
  try {
    for (const entry of remoteEntries) {
      if (entry.type === "model-cache") {
        console.info(`streaming from ${entry.url}`);
        const models = await entry.importRemote(name);
        remoteModels.push(models);
      }
    }
  } catch (e) {
    console.error(e);
  }

  console.timeEnd(label);

  if (remoteModels.length === 0) return;

  return remoteModels.reduce((p, c) => ({ ...p, ...c }));
}

/**
 * Imports remote service modules.
 */
export async function importServicesCache(remoteEntries) {
  const label = "\ntime to import remote services cache";
  console.time(label);

  let services = [];
  for (const entry of remoteEntries) {
    if (entry.type === "service-cache") {
      console.info(`streaming from ${entry.url}`);
      const service = await entry.importRemote();
      services.push(service);
    }
  }

  console.timeEnd(label);

  if (services.length === 0) return;

  return services.reduce((p, c) => ({ ...p, ...c }));
}

export async function importAdaptersCache(remoteEntries) {
  const label = "\ntime to import remote adapters cache";
  console.time(label);

  let adapters = [];
  for (const entry of remoteEntries) {
    if (entry.type === "adapter-cache") {
      console.info(`streaming from ${entry.url}`);
      const adapter = await entry.importRemote();
      adapters.push(adapter);
    }
  }

  console.timeEnd(label);

  if (adapters.length === 0) return;

  return adapters.reduce((p, c) => ({ ...p, ...c }));
}
