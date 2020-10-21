import ModelFactory from './model-factory';
import {
  importRemoteModels,
  importRemoteServices,
  // findRemoteServices
} from '../services/import-remotes';

/**
 * @typedef {Object} Model
 * @property {Symbol} id
 * @property {Symbol} modelName
 * @property {Symbol} createTime
 * @property {Symbol} onUpdate
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

/**
 * Import and register remote models.
 */
export async function initModels(plugins) {
  const models = await importRemoteModels();
  const svcs = await importRemoteServices();
  const services = { ...svcs, ...plugins };
  // const dynRemSrvcs = await findRemoteServices();
  // const module = await dynRemSrvcs();
  // console.log(module);

  console.log('models');
  console.log(models);
  console.log('services');
  console.log(services);

  Object.values(models).forEach(model => {
    if (model.hasOwnProperty('modelName')
      && model.hasOwnProperty('factory')
      && model.hasOwnProperty('endpoint')) {

      // Overwrite mock dependencies with real ones!
      const deps = { ...model.dependencies, ...services };

      ModelFactory.registerModel({
        ...model,
        factory: model.factory(deps),
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

export default ModelFactory;