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
 * @property {Symbol} onUpdate
 * @property {Symbol} onDelete
 * 
 * @typedef {import('../models/event').Event} Event
 * 
 * @typedef {Object} ModelFactory
 * @property {function(string,*):Promise<Readonly<Model>>} createModel
 * @property {function(string,string,*):Promise<Readonly<Event>>} createEvent
 * @property {function(Model,object):Model} updateModel
 * @property {function(Model):Model} deleteModel
 * @property {function(string,string):string} getEventName
 * @property {{CREATE:string,UPDATE:string,DELETE:string}} EventTypes
 * @property {function(any):string} getModelId
 * 
 * @callback onUpdate
 * @param {Model} model
 * @param {Object} changes
 * @returns {Model | Error} updated model or throw
 * 
 * @callback onDelete
 * @param {Model} model
 * @returns {Model | Error} updated model or throw
 * 
 * @typedef {{
 *  [x: string]: {
 *    service: string,
 *    type?:'inbound'|'outbound',
 *    disabled?: boolean
 *    adapter?: string
 *  }
 * }} port
 * 
 * @typedef {Object} ModelSpecification Specify model data and behavior 
 * @property {string} modelName name of model (case-insenstive)
 * @property {string} endpoint URI reference (e.g. plural of `modelName`)
 * @property {function(...args): any} factory factory function that creates model
 * @property {object} dependencies injected into the model for inverted control
 * @property {Array<import("./mixins").mixinFunction>} [mixins] functional mixins
 * @property {onUpdate} [onUpdate] function called to handle update requests
 * @property {onDelete} [onDelete] function called before deletion
 * @property {port[]} [ports] input/output ports for the domain
 * @property {Array<function({
 *  eventName:string,
 *  eventType:string,
 *  eventTime:string,
 *  modelName:string,
 *  model:Model
 * }):Promise<void>>} [eventHandlers] callbacks invoked when model events occur 
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

/**
 * In a hex arch, ports and adapters control I/O between 
 * the application core (domain) and the outside world. 
 * This function calls adapter factory functions passing
 * in their service dependencies. Using module federation,
 * adapters and services are overridden at runtime to rewire
 * ports to the actual service entry points.
 * @param {port} ports - domain interfaces
 * @param {{[x:string]:function(*):function(*):any}} adapters - service adapters 
 * @param {*} services - (micro-)services 
 */
function makeAdapters(ports, adapters, services) {
  if (!ports || !adapters || !services) {
    return;
  }
  return Object.keys(ports).map(port => {
    try {
      if (services[ports[port].service] && adapters[port]) {
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

/**
 * Import remote models and override existing service adapters
 * with those passed into the function by the remotes config.
 * @param {*} services - services on which the model depends
 * @param {*} adapters - adapters for talking to the services
 */
async function initModels(services, adapters) {
  const models = await importRemoteModels();

  console.log('models');
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
 * @param {*} overrides - override services or adapters
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