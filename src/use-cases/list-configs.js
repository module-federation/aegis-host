export default function listConfigsFactory({ models } = {}) {
  return async function listConfigs() {
    const list = models.getRemoteModels();

    console.log({ func: listConfigs.name, list });
    return list.map(m => m.getSpec());
  };
}
