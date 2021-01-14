"use strict";

import checkAcl from "../lib/check-acl";

const commandType = {
  /**
   *
   * @param {function(import("../models").Model)} command
   * @param {import("../models").Model} model
   */
  function: async (command, model) => command(model),
  /**
   *
   * @param {string} command
   * @param {import("../models").Model} model
   */
  string: async (command, model) => model[command](),
};

function commandAuthorized(spec, command, permission) {
  return (
    command &&
    spec.commands[command] &&
    checkAcl(spec.commands[command].acl, permission)
  );
}

/**
 *
 * @param {import("../models").ModelFactory} models
 * @param {import("../models").Model} model
 * @param {{command:string}} query
 */
export default async function executeCommand(
  models,
  model,
  command,
  permission
) {
  const spec = models
    .getRemoteModels()
    .find((s) => s.modelName === models.getModelName(model));

  if (!spec) {
    console.log("can't find spec for", models.getModelName(model));
    return null;
  }

  if (commandAuthorized(spec, command, permission)) {
    const cmd = spec.commands[command].command;

    if (commandType[typeof cmd]) {
      const result = await commandType[typeof cmd](cmd, model);

      if (result) {
        return { ...model, ...result };
      }
    }
  }
  return null;
}
