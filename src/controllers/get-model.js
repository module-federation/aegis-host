import log from "../lib/logger";

export default function getModelFactory(listModels) {
  return async function getModel(httpRequest) {
    log({ function: "getModel" });
    try {
      const { source = {} } = httpRequest.body;
      source.ip = httpRequest.ip;
      source.browser = httpRequest.headers["User-Agent"];
      if (httpRequest.headers["Referer"]) {
        source.referrer = httpRequest.headers["Referer"];
      }
      log(source);
      const query = httpRequest.query

      const models = await listModels(query);

      return {
        headers: {
          "Content-Type": "application/json",
        },
        statusCode: 200,
        body: { models },
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
