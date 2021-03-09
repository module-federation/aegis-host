import log from "../lib/logger";

export default function getConfigFactory(listConfigs) {
  return async function getConfig(httpRequest) {
    log({ function: "getConfigs" });
    try {
      httpRequest.log(getConfig.name);

      const configs = await listConfigs();

      return {
        headers: {
          "Content-Type": "application/json",
        },
        statusCode: 200,
        body: configs,
      };
    } catch (e) {
      log(e);

      return {
        headers: {
          "Content-Type": "application/json",
        },
        statusCode: 400,
        body: {
          error: e.message,
        },
      };
    }
  };
}
