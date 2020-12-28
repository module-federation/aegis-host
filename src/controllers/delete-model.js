import log from "../lib/logger";

export default function deleteModelFactory(removeModel, getModelId, hash) {
  return async function deleteModel(httpRequest) {
    try {
      const { source = {}, ...modelInfo } = httpRequest.body;
      log({ function: "patchModel", ...modelInfo });

      source.ip = httpRequest.ip;
      source.browser = httpRequest.headers["User-Agent"];
      if (httpRequest.headers["Referer"]) {
        source.referrer = httpRequest.headers["Referer"];
      }
      log(source);
      const id = httpRequest.params.id;

      const model = await removeModel(id);
      // log({ function: removeModel.name, modelData: { ...model } });

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

      if (e.message === "no such id") {
        return {
          headers: {
            "Content-Type": "application/json",
          },
          statusCode: 404,
        };
      }

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
