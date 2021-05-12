"use strict";
/**
 * @callback httpController
 * @param {{
 *  body:{key1,keyN},
 *  query:{key1},
 *  params:{key1,keyN},
 *  log:(functionName)=>void
 * }} httpRequest
 * @returns {{
 *  body:{key1,keyN},
 *  headers:{key1,keyN}
 * }}
 */

/**
 * @param {httpController} controller
 */
export default function buildCallback(controller) {
  return async (req, res) => {
    const httpRequest = {
      body: req.body,
      query: req.query,
      params: req.params,
      //ip: req.ip,
      method: req.method,
      path: req.path,
      // headers: {
      //   "Content-Type": req.get("Content-Type"),
      //   Referer: req.get("referer"),
      //   "User-Agent": req.get("User-Agent"),
      // },

      log(func) {
        //const { source = {}, ...payload } = httpRequest.body;
        //source.ip = httpRequest.ip;
        //source.browser = httpRequest.headers["User-Agent"];

        // if (httpRequest.headers["Referer"]) {
        //   source.referrer = httpRequest.headers["Referer"];
        // }

        console.info({
          function: func,
          method: httpRequest.method,
          params: httpRequest.params,
          query: httpRequest.query,
          //source,
          ...httpRequest.body,
        });
      },
    };

    return controller(httpRequest)
      .then(httpResponse => {
        if (httpResponse.headers) {
          res.set(httpResponse.headers);
        }
        res.type("json");
        res.status(httpResponse.statusCode).send(httpResponse.body);
        return httpResponse;
      })
      .catch(e => res.status(500).send({ error: "An unkown error occurred." }));
  };
}
