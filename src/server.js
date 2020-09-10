'use strict'

import {
  postModels,
  patchModels,
  getModels
} from "./controllers";
import { initModels } from './models';
import buildCallback from "./controllers/build-callback";
import express from "express";
import bodyParser from "body-parser";
import initMiddleware from './middleware';
import log from './lib/logger';

const Server = (() => {
  const app = express();
  const API_ROOT = "/api";
  const PORT = 8070;

  app.use(bodyParser.json());
  app.get(
    '/',
    (req, res) => res.send('Federated Monolith Demo')
  );

  function make(path, app, method, controllers) {
    controllers().map(controller => {
      log(controller);
      app[method](
        path(controller.modelName),
        buildCallback(controller.factory)
      );
    });
  }

  function run() {
    initModels().then(() => {
      return Promise.all([
        make(
          (model) => `${API_ROOT}/${model}`,
          app,
          'post',
          postModels
        ),
        make(
          (model) => `${API_ROOT}/${model}/:id`,
          app,
          'patch',
          patchModels
        ),
        make(
          (model) => `${API_ROOT}/${model}`,
          app,
          'get',
          getModels
        )
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