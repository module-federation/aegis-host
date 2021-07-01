"use strict";

/**
 * @returns {Promise<import('.').ModelSpecification[]>}
 */
export async function importRemoteModels(remoteEntries) {
  const startTime = Date.now();

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

  console.info("model import took %d ms", Date.now() - startTime);

  if (remoteModels.length === 0) return;

  return remoteModels.reduce((p, c) => ({ ...p, ...c }));
}

/**
 * Imports remote service modules.
 */
export async function importRemoteServices(remoteEntries) {
  const startTime = Date.now();

  let services = [];
  for (const entry of remoteEntries) {
    if (entry.type === "service") {
      console.info(`streaming from ${entry.url}`);
      const service = await entry.importRemote();
      services.push(service);
    }
  }

  console.info("services import took %d ms", Date.now() - startTime);

  if (services.length === 0) return {};

  return services.reduce((p, c) => ({ ...p, ...c }));
}

export async function importRemoteAdapters(remoteEntries) {
  const startTime = Date.now();

  let adapters = [];
  for (const entry of remoteEntries) {
    if (entry.type === "adapter") {
      console.info(`streaming from ${entry.url}`);
      const adapter = await entry.importRemote();
      adapters.push(adapter);
    }
  }

  console.info("adapters import took %d ms", Date.now() - startTime);

  if (adapters.length === 0) return {};

  return adapters.reduce((p, c) => ({ ...p, ...c }));
}

export async function importModelCache(remoteEntries, name) {
  const startTime = Date.now();

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

  console.info("models import took %d ms", Date.now() - startTime);

  if (remoteModels.length === 0) return;

  return remoteModels.reduce((p, c) => ({ ...p, ...c }));
}

/**
 * Imports remote service modules.
 */
export async function importServiceCache(remoteEntries) {
  const startTime = Date.now();

  let services = [];
  for (const entry of remoteEntries) {
    if (entry.type === "service-cache") {
      console.info(`streaming from ${entry.url}`);
      const service = await entry.importRemote();
      services.push(service);
    }
  }

  console.info("services import took %d ms", Date.now() - startTime);

  if (services.length === 0) return;

  return services.reduce((p, c) => ({ ...p, ...c }));
}

export async function importAdapterCache(remoteEntries) {
  const startTime = Date.now();

  let adapters = [];
  for (const entry of remoteEntries) {
    if (entry.type === "adapter-cache") {
      console.info(`streaming from ${entry.url}`);
      const adapter = await entry.importRemote();
      adapters.push(adapter);
    }
  }

  console.info("adapters import took %d ms", Date.now() - startTime);

  if (adapters.length === 0) return;

  return adapters.reduce((p, c) => ({ ...p, ...c }));
}
