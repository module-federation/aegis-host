import { withId, withTimestamp, utc } from './mixins';
import asyncPipe from '../lib/async-pipe';
import uuid from '../lib/uuid';

/**
 * @callback GetModelName
 */

/**
 * @typedef {Object} Model
 * @property {GetModelName} getModelName
 * @property {String} id
 * @property {String} created
 */

const Model = (() => {

  const Model = ({ factory, args, modelName }) => {
    return Promise.resolve(
      factory(args)
    ).then(model => ({
      modelName: modelName,
      getModelName: () => modelName,
      ...model
    }));
  };

  const makeModel = asyncPipe(
    Model,
    withTimestamp(utc),
    withId(uuid),
  );

  return {
    /**
     * 
     * @param {{factory: Function, args: any, modelName: String}} options 
     * @returns {Promise<Model>}
     */
    create: async function (options) {
      return makeModel(options);
    }
  }
})();

export default Model;

