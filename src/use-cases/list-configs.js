export default function listConfigsFactory({ models } = {}) {
  return async function listConfigs() {
    const list = models.getRemoteModels();
    console.debug({ func: listConfigs.name, list });
    return list;
  };
}
