"use strict";

let controller = null;

/**
 * Start `startService` if it hasn't been started
 * already, and wait for it to return the`control`
 * function, which allows us to call any controller
 * in the service. Save a reference to it so we can use
 * it agan on the next call and avoid starting the service again,
 * which is what would happen if we were warm-started.
 * @param {function()} startService - callback that starts service (MicroLib)
 * @param {"aws"|"google"|"azure"|"ibm"} provider - the name of the serverless provider
 * @param {{req:{send:function(),status:function()},res:{}}} parsers - messsage parsers
 * @returns {Promise<{invoke:function(...args)}>}
 * call `invoke` to parse the input and call the `controller`
 */
module.exports.ServerlessAdapter = async function (
  startService,
  provider,
  parsers
) {
  function parsePayload(...args) {
    console.debug({ name: parsePayload.name, provider, parsers, args });
    const parse = parsers[provider];

    if (typeof parse === "function") {
      const output = parse(...args);
      console.debug({ func: parse.name, output });
      return output;
    }
    console.warn("no parser found for provider");
  }

  /**
   * invokes the controller for a given route
   * @param  {...any} args
   */
  function invoke(...args) {
    const { req, res } = parsePayload(...args);
    return controller(req.path, req.method, req, res);
  }

  if (controller) {
    return {
      invoke,
    };
  }

  // Call MicroLib and wait for controller
  controller = await startService();

  /**
   * @todo fix the upstream async problem:
   * Something isn't awaiting during startup,
   * so we end up invoking too soon, before
   * the APIs have finished building.
   */
  await new Promise(resolve => setTimeout(resolve, 4000));

  return {
    invoke,
  };
};
