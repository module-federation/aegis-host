'use strict'

import RestControllerFactory, {
  postModels,
  patchModels
} from "./controllers";
import { initModels } from './models';
import buildCallback from "./controllers/build-callback";
import express from "express";
import bodyParser from "body-parser";
import initMiddleware from './middleware';
import initRemoteModels from "./services/init-remote-models";

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

  function make(path, app, method, controllers) {
    controllers().map(controller => {
      console.log(controller);
      app[method](
        path(controller.modelName),
        buildCallback(controller.factory)
      );
    });
  }

  function run() {
    initModels().then(() => {
      return Promise.all([
        make((p) => `${API_ROOT}/${p}`, app, 'post', postModels),
        make((p) => `${API_ROOT}/${p}/:id`, app, 'patch', patchModels)
      ]);
    }).then(() => {
      app.listen(
        PORT,
        () => {
          console.log(`Server listening on port ${PORT}`);
        }
      )
    });
  }

  function start() {
    initMiddleware(app, API_ROOT, run);
  }

  return {
    start
  }

})();

export default Server;