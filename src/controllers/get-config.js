import log from "../lib/logger";

export default function getConfigFactory(listConfigs) {
  return async function getConfig(httpRequest) {
    log({ function: "getConfigs" });
    try {
      const { source = {} } = httpRequest.body;
      source.ip = httpRequest.ip;
      source.browser = httpRequest.headers["User-Agent"];
      if (httpRequest.headers["Referer"]) {
        source.referrer = httpRequest.headers["Referer"];
      }
      log(source);

      const configs = await listConfigs();
      log(configs);

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
