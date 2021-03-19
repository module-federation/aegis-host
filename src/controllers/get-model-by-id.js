/**
 * @param {import("../use-cases/find-model").findModel} findModel
 * @returns {import("../adapters/http-adapter").httpController}
 */
export default function getModelByIdFactory(findModel) {
  return async function getModelById(httpRequest) {
    try {
      httpRequest.log(getModelById.name);

      const id = httpRequest.params.id;
      const query = httpRequest.query;

      const model = await findModel(id, query);

      return {
        headers: {
          "Content-Type": "application/json",
        },
        statusCode: 200,
        body: model,
      };
    } catch (e) {
      console.error(e.message);

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
