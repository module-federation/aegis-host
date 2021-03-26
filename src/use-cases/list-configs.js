export default function listConfigsFactory({ models } = {}, clear = false) {
  return async function listConfigs() {
    const list = models.getRemoteModels();
    return list;
  };
}
