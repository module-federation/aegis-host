import log from "../lib/logger";

export default function getConfigFactory(listConfigs) {
  return async function getConfig(httpRequest) {
    try {
      const configs = await listConfigs();

      //httpRequest.log(getConfig.name);

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
