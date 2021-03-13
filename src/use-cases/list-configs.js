export default function listConfigsFactory({ models } = {}, clear = false) {
  return async function listConfigs() {
    if (clear) {
      models.clearModels();
      console.debug({
        desc: ">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>",
        models: models.getRemoteModels(),
      });
      return;
    }
    const list = models.getRemoteModels();
    return list;
  };
}
