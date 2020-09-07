'use strict'

import RestControllerFactory from "./controllers";
import buildCallback from "./controllers/build-callback";
import express from "express";
import bodyParser from "body-parser";
import initMiddleware from './middleware';

const Server = (() => {
  const app = express();
  const API_ROOT = "/api";
  const PORT = 8070;

  app.use(bodyParser.json());
  app.post(
    `${API_ROOT}/model1`,
    buildCallback(RestControllerFactory.postModel1)
  );
  app.patch(
    `${API_ROOT}/model1/:id`,
    buildCallback(RestControllerFactory.patchModel1)
  );
  app.put(
    `${API_ROOT}/model1/:id`,
    buildCallback(RestControllerFactory.patchModel1)
  );
  app.get(
    `${API_ROOT}/model1`,
    buildCallback(RestControllerFactory.getModel1)
  );
  app.post(
    `${API_ROOT}/model2`,
    buildCallback(RestControllerFactory.postModel2)
  );
  app.patch(
    `${API_ROOT}/model2/:id`,
    buildCallback(RestControllerFactory.patchModel2)
  );
  app.put(
    `${API_ROOT}/model2/:id`,
    buildCallback(RestControllerFactory.patchModel2)
  );
  app.get(
    '/',
    (req, res) => res.send('Federated Monolith Demo')
  );

  function run() {
    app.listen(
      PORT,
      () => {
        console.log(`Server listening on port ${PORT}`);
      }
    );
  }

  function start() {
    initMiddleware(app, API_ROOT, run);
  }

  return {
    start
  }

})();

export default Server;