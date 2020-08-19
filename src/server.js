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
  //const webpack = require('webpack');
  // const webpackDevMiddleware = require('webpack-dev-middleware');
  // const config = require('../webpack.config.js');
  // const compiler = webpack(config);

  // app.use(webpackDevMiddleware(compiler, {
  //   publicPath: config.output.publicPath,
  // }));

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
    initMiddleware(run);
  }

  return {
    start
  }

})();

export default Server;