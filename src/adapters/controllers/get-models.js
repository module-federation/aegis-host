/**
 *
 * @param {import("../use-cases/list-models").listModels} listModels
 * @returns {import("../adapters/http-adapter").httpController}
 */
export default function getModelsFactory(listModels) {
  return async function getModels(httpRequest) {
    try {
      httpRequest.log(getModels.name);

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
