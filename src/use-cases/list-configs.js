export default function listConfigsFactory({ models } = {}) {
  return async function listConfigs() {
    const list = models.getRemoteModels();
    return list;
  };
}
