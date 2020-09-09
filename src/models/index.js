import crypto from 'crypto';
import ModelFactory from './model-factory';
import createModel1Factory, { validateModel1Factory } from './model1';
import createModel1EventFactory from './model1-create-event';
import updateModel1EventFactory from './model1-update-event';
import createModel2Factory from './model2';
import { MODEL_NAME as MODEL1 } from './model1';
import { MODEL_NAME as MODEL2 } from './model2';
import initRemoteModels from '../services/init-remote-models';

function hash(data) {
  return crypto.createHash('sha1').update(data).digest('hex');
}

const factory = ModelFactory.getInstance();

export async function initModels() {
  await initRemoteModels(ModelFactory.getInstance());
}


factory.registerModel(
  MODEL1,
  createModel1Factory(hash),
  validateModel1Factory()
);

factory.registerEvent(
  ModelFactory.EventTypes.CREATE,
  MODEL1,
  createModel1EventFactory()
);

factory.registerEvent(
  ModelFactory.EventTypes.UPDATE,
  MODEL1,
  updateModel1EventFactory()
);

createModel2Factory().then((fn) => {
  factory.registerModel(MODEL2, fn);
  factory.registerEvent(
    ModelFactory.EventTypes.CREATE,
    MODEL2,
    (m) => ({ eventData: { ...m } })
  );
  factory.registerEvent(
    ModelFactory.EventTypes.UPDATE,
    MODEL2,
    ({ updated, changes }) => ({
      updated: { ...updated },
      changes: { ...changes }
    })
  );
});

export default ModelFactory;