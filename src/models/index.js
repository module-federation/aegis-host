import ModelFactory from './model-factory';
import importRemoteModels from '../services/import-remote-models';

/**
 * 
 * @typedef ModelFactory
 * @property {function(string,*):Promise<Readonly<any>>} createModel
 * @property {function(string,string,*):Promise<Readonly<any>>} createEvent
 * @property {function(string,string):string} getEventName
 * @property {{CREATE:string,UPDATE:string,DELETE:string}} EventTypes
 * @property {function(any):string} getModelId
 */

/**
 * 
 * @param {*} model 
 */
const createEventFactory = (model) => ({
  modelData: { ...model }
});

const updateEventFactory = ({ updated, changes }) => ({
  updated: { ...updated },
  changes: { ...changes }
});

const deleteEventFactory = (model) => ({
  modelId: ModelFactory.getModelId(model),
  modelData: { ...model }
});

/**
 * Import and register remote models.
 */
export async function initModels() {
  const models = await importRemoteModels();
  console.log(models);

  Object.values(models).forEach(model => {
    if (model.hasOwnProperty('modelName')
      && model.hasOwnProperty('factory')) {

      ModelFactory.registerModel({
        modelName: model.modelName,
        endpoint: model.endpoint,
        factory: model.factory,
        onUpdate: model.onUpdate,
        onDelete: model.onDelete,
        mixins: model.mixins,
        eventHandlers: model.eventHandlers,
        isRemote: true,
      });

      ModelFactory.registerEvent(
        ModelFactory.EventTypes.CREATE,
        model.modelName,
        createEventFactory
      );

      ModelFactory.registerEvent(
        ModelFactory.EventTypes.UPDATE,
        model.modelName,
        updateEventFactory
      );

      ModelFactory.registerEvent(
        ModelFactory.EventTypes.DELETE,
        model.modelName,
        deleteEventFactory
      );
    }
  });
}

export default ModelFactory;