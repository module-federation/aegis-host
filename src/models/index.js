"use strict";

import ModelFactory from "./model-factory";
import makeAdapters from "./make-adapters";
import {
  importRemoteModels,
  importRemoteServices,
  importRemoteAdapters,
} from "../services/federation-service";

/**
 * @typedef {string} eventName
 * @typedef {Object} Model Every imported domain object created by the framework 
 * is a `Model`, which allows it to be extended and controlled through configuration. 
 * Note that the framework does not use inheritance. All objects are immutable; 
 * all extensions are applied to copies of the original.
 * @property {string} id
 * @property {string} modelName
 * @property {string} createTime
 * @property {string} onUpdate
 * @property {string} onDelete
 * @property {function():Promise<Model>} update user code calls this to update the model
 * @property {function(eventName,function(eventName,Model):void)} addListener listen for domain events
 * @property {function(eventName,Model):Promise<void>} emit emit domain event 
 *
 * @typedef {import('../models/event').Event} Event
 *
 * @typedef {Object} ModelFactory Creates new model instances.
 * @property {function(string,*):Promise<Readonly<Model>>} createModel
 * @property {function(string,string,*):Promise<Readonly<Event>>} createEvent
 * @property {function(Model,object):Model} updateModel
 * @property {function(Model):Model} deleteModel
 * @property {function(string,string):string} getEventName
 * @property {{CREATE:string,UPDATE:string,DELETE:string}} EventTypes
 * @property {function(any):string} getModelId
 * @property {function(Model):string[]} getPortFlow 
 * @property {function(Model,string):Model} loadModel
 * @property {function():ModelSpecification[]} getRemoteModels  
 *
 * @typedef {string} service - name of the service object to inject in adapter
 * @typedef {number} timeout - call to adapter will timeout after `timeout` milliseconds
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
 *    service?: service,
 *    timeout?: timeout,
 *    consumesEvent?:string,
 *    producesEvent?:string,
 *    callback?: function({model: Model})
 *    errorCallback?: function({model: Model, port: string, error:Error}),
 *    timeoutCallback?: function({model: Model, port: string}),
 *    type?:'inbound'|'outbound',
 *    disabled?: boolean
 *    adapter?: string,
 *    retries?: number
 *    undo: function(Model, port)
 *  }
 * }} ports - input/output ports for the domain
 *
 * @typedef {any} value
 * @typedef {any} key
 *
 * @typedef {{
 *  on: "serialize" | "deserialize",
 *  key: string | "*" | RegExp | function(key,value):boolean
 *  type: (function(key,value):boolean) | "string" | "object" | "number" | "function" | "any" | RegExp
 *  value: function(key, value):any
 * }} serializer
 * 
 * @typedef {Array<function({
 *  eventName:string,
 *  eventType:string,
 *  eventTime:string,
 *  modelName:string,
 *  model:Model
 * }):Promise<void>>} eventHandler
 *
 * @typedef {Object} ModelSpecification Specify model data and behavior
 * @property {string} modelName name of model (case-insenstive)
 * @property {string} endpoint URI reference (e.g. plural of `modelName`)
 * @property {function(...args): any} factory factory function that creates model
 * @property {object} [dependencies] injected into the model for inverted control
 * @property {Array<import("./mixins").functionalMixin>} [mixins] functional mixins
 * @property {onUpdate} [onUpdate] function called to handle update requests
 * @property {onDelete} [onDelete] function called before deletion
 * @property {ports} [ports] input/output ports for the domain
 * @property {eventHandler[]} [eventHandlers] callbacks invoked (after save) when CRUD write events occur
 * @property {serializer[]} serializers callbacks invoked to de/serialzed the model
 */

/**
 *
 * @param {Model} model
 */
const createEvent = (model) => ({
  model: model,
});

/**
 * @param {{updated:Model,changes:Object}} param0
 */
const updateEvent = ({
  updated,
  changes
}) => ({
  model: updated,
  changes: {
    ...changes,
  },
});

const deleteEvent = (model) => ({
  modelId: ModelFactory.getModelId(model),
  model: model,
});

/**
 * Imports remote models and overrides their service adapters
 * with those specified by the host config.
 * @param {*} services - services on which the model depends
 * @param {*} adapters - adapters for talking to the services
 */
async function initModels(services, adapters) {
  const models = await importRemoteModels();

  console.log("models", models);

  Object.values(models).forEach((model) => {
    if (
      model.hasOwnProperty("modelName") &&
      model.hasOwnProperty("factory") &&
      model.hasOwnProperty("endpoint")
    ) {
      const serviceAdapters = makeAdapters(model.ports, adapters, services);

      // override adapters
      const dependencies = {
        ...model.dependencies,
        ...serviceAdapters,
      };

      ModelFactory.registerModel({
        ...model,
        dependencies,
        factory: model.factory(dependencies),
        isRemote: true,
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
 * @param {*} overrides - override or add services and adapters
 */
export async function initRemotes(overrides) {
  const services = await importRemoteServices();
  const adapters = await importRemoteAdapters();

  console.log({
    services,
    adapters,
    overrides,
  });

  await initModels({
    ...services,
    ...overrides,
  }, {
    ...adapters,
    ...overrides,
  });
}

export default ModelFactory;