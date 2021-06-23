"use strict";

export default function getConfigFactory(listConfigs) {
  return async function getConfig(httpRequest) {
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
