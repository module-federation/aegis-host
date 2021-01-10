import log from "../lib/logger";

export default function getModelByIdFactory(findModel) {
  return async function getModelById(httpRequest) {
    log({ function: "findModel" });
    try {
      const { source = {} } = httpRequest.body;
      source.ip = httpRequest.ip;
      source.browser = httpRequest.headers["User-Agent"];
      if (httpRequest.headers["Referer"]) {
        source.referrer = httpRequest.headers["Referer"];
      }
      log(source);
      const id = httpRequest.params.id;
      const query = httpRequest.query;
      console.log({func:getModelById.name, query:httpRequest.query});

      const model = await findModel(id, query);
      // log({ function: findModel.name, ...model });

      return {
        headers: {
          "Content-Type": "application/json",
        },
        statusCode: 200,
        body: { model },
      };
    } catch (e) {
      log(e.message);

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
