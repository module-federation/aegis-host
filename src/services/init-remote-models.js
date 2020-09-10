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

    factory.registerModel(
      model.modelName,
      model.factory,
      model.isValid,
      true
    );

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