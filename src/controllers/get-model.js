/**
 *
 * @param {import("../use-cases/list-models").listModels} listModels
 * @returns {import("../adapters/http-adapter").httpController}
 */
export default function getModelFactory(listModels) {
  return async function getModel(httpRequest) {
    try {
      httpRequest.log(getModel.name);

      const models = await listModels(httpRequest.query);

      return {
        headers: {
          "Content-Type": "application/json",
        },
        statusCode: 200,
        body: models,
      };
    } catch (e) {
      console.error(e);

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
