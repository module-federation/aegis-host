import log from "../lib/logger";
/**
 *
 * @param {import("../use-cases/edit-model").editModel} editModel
 */
export default function patchModelFactory(editModel, hash) {
  return async function patchModel(httpRequest) {
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
      const command = httpRequest.params.command;

      const model = await editModel(id, { ...modelInfo }, command);

      return {
        headers: {
          "Content-Type": "application/json",
          "Last-Modified": new Date().toUTCString(),
          ETag: hash(JSON.stringify(model)),
        },
        statusCode: 201,
        body: { modelId: model.getId() },
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
