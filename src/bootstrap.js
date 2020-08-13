'use strict'

import RestControllerFactory from "./controllers";
import buildCallback from "./controllers/build-callback";
import express from "express";
import bodyParser from "body-parser";

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
  '/',
  (req, res) => res.send('fedmon')
);
app.get(
  `${API_ROOT}/model1`,
  buildCallback(RestControllerFactory.getModel1)
);

app.listen(
  PORT,
  () => {
    console.log(`Server listening on port ${PORT}`);
  }
);

export default app;
