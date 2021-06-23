/**
 *
 * @param {import("../use-cases/remove-model").removeModel} removeModel
 * @returns {import("../adapters/http-adapter").httpController}
 */
export default function deleteModelFactory(removeModel, hash) {
  return async function deleteModel(httpRequest) {
    try {
      httpRequest.log(deleteModel.name);

      const model = await removeModel(httpRequest.params.id);

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
      console.error(e);

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
