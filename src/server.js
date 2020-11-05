'use strict'

import express from 'express';
import bodyParser from 'body-parser';

require('dotenv').config();

import {
  postModels,
  patchModels,
  getModels,
  getModelsById,
  deleteModels,
} from './controllers';

import { initRemotes } from './models';
import { listen, notify } from './adapters/event-adapter';
import { Event } from './services/event-service';
import { Persistence } from './services/persistence-service';
import { save } from './adapters/persistence-adapter';
import callback from './adapters/http-callback';
import initMiddleware from './middleware';
import log from './lib/logger';

const Server = (() => {
  const app = express();
  const API_ROOT = '/api';
  const PORT = 8070;
  const ENDPOINT = (e) => `${API_ROOT}/${e}`;
  const ENDPOINTID = (e) => `${API_ROOT}/${e}/:id`;

  app.use(bodyParser.json());
  app.use(express.static('public'));

  function make(path, app, method, controllers) {
    controllers().forEach(ctlr => {
      log(ctlr);
      app[method](path(ctlr.endpoint), callback(ctlr.fn));
    });
  }

  function run() {
    const importStartTime = Date.now();
    const overrides = { save, Persistence };

    initRemotes(overrides).then(() => {
      log('\n%dms to import & register models\n',
        Date.now() - importStartTime);

      const makeEPStartTime = Date.now();

      make(ENDPOINT, app, 'post', postModels);
      make(ENDPOINT, app, 'get', getModels);
      make(ENDPOINTID, app, 'patch', patchModels);
      make(ENDPOINTID, app, 'get', getModelsById);
      make(ENDPOINTID, app, 'delete', deleteModels);

      log('\n%dms to create endpoints\n',
        Date.now() - makeEPStartTime);

      app.listen(
        PORT,
        () => {
          console.log(`Server listening on http://localhost:${PORT}`);
        }
      );

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