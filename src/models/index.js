import Model from './model';
import ModelFactory from './model-factory';
import importRemoteModels from '../services/import-remote-models';

const createEventFactory = (model) => ({
  modelData: { ...model }
});

const updateEventFactory = ({ updated, changes }) => ({
  updated: { ...updated },
  changes: { ...changes }
});

const deleteEventFactory = (model) => ({
  modelId: Model.getId(model),
  modelData: { ...model }
});

export async function initModels() {
  const factory = ModelFactory.getInstance();
  const models = await importRemoteModels();
  console.log(models);

  Object.values(models).forEach(model => {
    if (model.hasOwnProperty('modelName')
      && model.hasOwnProperty('factory')) {

      factory.registerModel({
        modelName: model.modelName,
        factory: model.factory,
        onUpdate: model.onUpdate,
        onDelete: model.onDelete,
        mixins: model.mixins,
        isRemote: true,
      });

      factory.registerEvent(
        factory.EventTypes.CREATE,
        model.modelName,
        createEventFactory
      );

      factory.registerEvent(
        factory.EventTypes.UPDATE,
        model.modelName,
        updateEventFactory
      );

      factory.registerEvent(
        factory.EventTypes.DELETE,
        model.modelName,
        deleteEventFactory
      );
    }
  });
}

export default ModelFactory;