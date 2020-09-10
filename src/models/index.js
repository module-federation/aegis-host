import ModelFactory from './model-factory';
import initRemoteModels from '../services/init-remote-models';

export async function initModels() {
  await initRemoteModels(ModelFactory.getInstance());
}

export default ModelFactory;