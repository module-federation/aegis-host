import crypto from 'crypto';
import ModelFactory from './model-factory';
import createModel1Factory, {validateModel1Factory} from './model1';
import createModel1EventFactory from './model1-create-event';
import updateModel1EventFactory from './model1-update-event';
import { MODEL_NAME as MODEL1 } from './model1';

function hash(data) {
  return crypto.createHash('md5').update(data);
}

const factory = ModelFactory.getInstance();

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

export default ModelFactory;