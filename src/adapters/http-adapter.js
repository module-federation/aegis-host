"use strict";
/**
 * @callback httpController
 * @param {{
 *  body:{key1:val1,keyN:valN},
 *  query:{key1:val1,keyN:valN},
 *  params:{key1:val1,keyN:valN},
 *  log:(functionName)=>void
 * }} httpRequest
 */

/**
 * @param {httpController} controller
 */
export default function buildCallback(controller) {
  return (req, res) => {
    const httpRequest = {
      body: req.body,
      query: req.query,
      params: req.params,
      ip: req.ip,
      method: req.method,
      path: req.path,
      headers: {
        "Content-Type": req.get("Content-Type"),
        Referer: req.get("referer"),
        "User-Agent": req.get("User-Agent"),
      },

      log(func) {
        const { source = {}, ...payload } = httpRequest.body;
        source.ip = httpRequest.ip;
        source.browser = httpRequest.headers["User-Agent"];

        if (httpRequest.headers["Referer"]) {
          source.referrer = httpRequest.headers["Referer"];
        }

        console.info({
          function: func,
          method: httpRequest.method,
          source,
          ...payload,
        });
      },
    };

    controller(httpRequest)
      .then(httpResponse => {
        if (httpResponse.headers) {
          res.set(httpResponse.headers);
        }
        res.type("json");
        res.status(httpResponse.statusCode).send(httpResponse.body);
      })
      .catch(e => res.status(500).send({ error: "An unkown error occurred." }));
  };
}
