const createEventFactory = (model) => ({
  eventData: { ...model }
});

const updateEventFactory = ({ updated, changes }) => ({
  updated: { ...updated },
  changes: { ...changes }
});

/**
 * @param {import('../models/model-factory').ModelFactory} factory
 */
export default async (factory) => {
  const models = (await import('fedmonserv/models')).default;

  models.forEach(model => {

    factory.registerModel({
      modelName: model.modelName,
      fnFactory: model.factory,
      fnIsValid: model.isValid,
      fnHandler: model.handler,
      isRemote: true
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
  });
}