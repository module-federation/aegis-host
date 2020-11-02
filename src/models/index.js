'use strict'

import ModelFactory from './model-factory';
import {
  importRemoteModels,
  importRemoteServices,
  importRemoteAdapters
} from '../services/import-remotes';

/**
 * @typedef {Object} Model
 * @property {Symbol} id
 * @property {Symbol} modelName
 * @property {Symbol} createTime
 * @property {Symbol(function)} onUpdate
 * @property {Symbol} onDelete
 */

/**
 * @typedef {import('../models/event').Event} Event
 */

/**
 * 
 * @typedef {Object} ModelFactory
 * @property {function(string,*):Promise<Readonly<Model>>} createModel
 * @property {function(string,string,*):Promise<Readonly<Event>>} createEvent
 * @property {function(Model,object):Model} updateModel
 * @property {function(Model):Model} deleteModel
 * @property {function(string,string):string} getEventName
 * @property {{CREATE:string,UPDATE:string,DELETE:string}} EventTypes
 * @property {function(any):string} getModelId
 */

/**
 * 
 * @param {Model} model 
 */
const createEvent = (model) => ({
  model: model
});

/**
 * @param {{updated:Model,changes:Object}} param0
 */
const updateEvent = ({ updated, changes }) => ({
  model: updated,
  changes: { ...changes },
});

const deleteEvent = (model) => ({
  modelId: ModelFactory.getModelId(model),
  model: model
});

function makeAdapters(ports, adapters, services) {
  if (!ports || !adapters || !services) {
    return;
  }
  return Object.keys(ports).map(port => {
    try {
      if (services[ports[port].service]) {
        return {
          [port]: adapters[port](
            services[ports[port].service]
          )
        }
      }
    } catch (e) {
      console.warn(e.message);
    }
  }).reduce((p, c) => ({ ...c, ...p }));
}

async function initModels(services, adapters) {
  const models = await importRemoteModels();

  console.log('\nmodels');
  console.log(models);

  Object.values(models).forEach(model => {
    if (model.hasOwnProperty('modelName')
      && model.hasOwnProperty('factory')
      && model.hasOwnProperty('endpoint')) {

      const serviceAdapters = makeAdapters(
        model.ports,
        adapters,
        services
      );

      // override adapters
      const dependencies = {
        ...model.dependencies,
        ...serviceAdapters
      };

      model.dependencies = dependencies;

      ModelFactory.registerModel({
        ...model,
        factory: model.factory(dependencies),
        isRemote: true
      });

      ModelFactory.registerEvent(
        ModelFactory.EventTypes.CREATE,
        model.modelName,
        createEvent
      );

      ModelFactory.registerEvent(
        ModelFactory.EventTypes.UPDATE,
        model.modelName,
        updateEvent
      );

      ModelFactory.registerEvent(
        ModelFactory.EventTypes.DELETE,
        model.modelName,
        deleteEvent
      );
    }
  });
}

/**
 * Import remote models, services, and adapters.
 * 
 * @param {*} overrides - override services and adapters
 */
export async function initRemotes(overrides) {
  const services = await importRemoteServices();
  const adapters = await importRemoteAdapters();

  console.log({
    services,
    adapters,
    overrides
  });

  await initModels(
    {
      ...services,
      ...overrides,
    },
    {
      ...adapters,
      ...overrides
    }
  );
}

export default ModelFactory