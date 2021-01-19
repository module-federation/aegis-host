import log from "../lib/logger";

export default function postModelFactory(addModel, getModelId, hash) {
  return async function postModel(httpRequest) {
    try {
      const { source = {}, ...modelInfo } = httpRequest.body;
      log({ function: "postModel", ...modelInfo });
      source.ip = httpRequest.ip;
      source.browser = httpRequest.headers["User-Agent"];
      if (httpRequest.headers["Referer"]) {
        source.referrer = httpRequest.headers["Referer"];
      }
      log(source);
      const command = httpRequest.params.command;

      log({ func: postModel.name, params: httpRequest.params });

      const model = await addModel({ ...modelInfo });
      log({ function: addModel.name, modelData: { ...model }, command });

      return {
        headers: {
          "Content-Type": "application/json",
          "Last-Modified": new Date().toUTCString(),
          ETag: hash(JSON.stringify(model)),
        },
        statusCode: 201,
        body: { modelId: getModelId(model) },
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
