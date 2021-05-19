"use strict";

let invokeController = null;

/**
 * Start `startService` if it hasn't been started
 * already, and wait for it to return the`control`
 * function, which allows us to call any controller
 * in the service. Save a reference to it so we can use
 * it agan on the next call and avoid starting the service again,
 * which is what would happen if we were warm-started.
 * @param {function():Promise<{function(...args):Promise<string>}>} startService - callback starts service (MicroLib)
 * @param {"aws"|"google"|"azure"|"ibm"} provider - the name of the serverless provider
 * @param {{req:{send:function(),status:function()},res:{}}} parsers - messsage parsers
 * @returns {Promise<{invoke:function(...args)}>}
 * call `invokeController` to parse the input and call the controller
 */
exports.ServerlessAdapter = async function (startService, provider, parsers) {
  /**
   *
   * @param {"request"|"response"} type
   * @param  {...any} args
   * @returns
   */
  function parseMessage(type, ...args) {
    const parse = parsers[provider][type];

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
  async function invoke(...args) {
    const { req, res } = parseMessage("request", ...args);
    const response = await invokeController(req.path, req.method, req, res);
    return parseMessage("response", response);
  }

  if (invokeController) {
    return {
      invokeController: invoke,
    };
  }

  // Call MicroLib and wait for controller
  invokeController = await startService();

  return {
    invokeController: invoke,
  };
};
