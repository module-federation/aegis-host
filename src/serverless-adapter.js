"use strict";

let controller = null;

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
 * call `invoke` to parse the input and call the `controller`
 */
module.exports.ServerlessAdapter = async function (
  startService,
  provider,
  parsers
) {
  function parseRequest(...args) {
    const parse = parsers[provider].request;

    if (typeof parse === "function") {
      const output = parse(...args);
      console.debug({ func: parse.name, output });
      return output;
    }
    console.warn("no parser found for provider");
  }

  function parseResponse(...args) {
    const parse = parsers[provider].response;

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
    const { req, res } = parseRequest(...args);
    const response = await controller(req.path, req.method, req, res);
    return parseResponse(response);
  }

  if (controller) {
    return {
      invoke,
    };
  }

  // Call MicroLib and wait for controller
  controller = await startService();

  return {
    invoke,
  };
};
