"use strict";

import checkAcl from "../lib/check-acl";
import async from "../lib/async-error";

const commandType = {
  /**
   *
   * @param {function(import("../models/model").Model)} command
   * @param {import("../models/model").Model} model
   */
  function: async (command, model) => command(model),
  /**
   *
   * @param {string} command
   * @param {import("../models/model").Model} model
   */
  string: async (command, model) => model[command](),
};

function commandAuthorized(spec, command, permission) {
  return (
    command &&
    spec.commands &&
    spec.commands[command] &&
    checkAcl(spec.commands[command].acl, permission)
  );
}

/**
 *
 * @param {import("../models/model-factory").ModelFactory} models
 * @param {import("../models/model").Model} model
 * @param {command:string} command - name of command
 * @param {string} permission - permission of caller
 */
export default async function executeCommand(
  models,
  model,
  command,
  permission
) {
  const spec = models.getModelSpec(model);

  if (!spec) {
    console.log("can't find spec for", models.getModelName(model));
    return null;
  }

  if (commandAuthorized(spec, command, permission)) {
    const cmd = spec.commands[command].command;

    if (typeof cmd === "function" || model[cmd]) {
      const result = await async(commandType[typeof cmd](cmd, model));

      if (result.ok) {
        return { ...model, ...result.data };
      }
    }

    console.warn("command not found", command);
    model.emit("unkownCommand", model);
  }
  console.warn("command unauthorized", command);

  return null;
}
