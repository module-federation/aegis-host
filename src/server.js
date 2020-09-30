'use strict'

import {
  postModels,
  patchModels,
  getModels,
  getModelsById, 
  deleteModels
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
  app.use(express.static('public'));

  function make(path, app, method, controllers) {
    controllers().map(cntrlr => {
      log(cntrlr);
      app[method](
        path(cntrlr.modelName),
        buildCallback(cntrlr.fn)
      );
    });
  }

  function run() {
    initModels().then(() => {
      return Promise.all([
        make(m => `${API_ROOT}/${m}`, app, 'post', postModels),
        make(m => `${API_ROOT}/${m}`, app, 'get', getModels),
        make(m => `${API_ROOT}/${m}/:id`, app, 'patch', patchModels),
        make(m => `${API_ROOT}/${m}/:id`, app, 'get', getModelsById),
        make(m => `${API_ROOT}/${m}/:id`, app, 'delete', deleteModels)
      ]);
    }).then(() => {
      app.listen(
        PORT,
        () => {
          console.log(`Server listening on http://localhost:${PORT}`);
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