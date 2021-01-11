"use strict";

const commandType = {
  function: async (command, model) => command(model),
  string: async (command, model) => model[command](),
};

/**
 *
 * @param {import("../models").ModelFactory} models
 * @param {import("../models").Model} model
 * @param {{command:string}} query
 */
export default async function executeCommand(models, model, query) {
  const spec = models
    .getRemoteModels()
    .find((s) => s.modelName === models.getModelName(model));

  if (!spec) {
    console.log("can't find spec for", models.getModelName(model));
    return null;      
  }

  if (query.command && spec.commands[query.command]) {
    const command = spec.commands[query.command];
    if (commandType[typeof command]) {
      const result = await commandType[typeof command](command, model);
      if (result) {
        return { ...model, ...result };
      }
    }
  }
  return null;
}
