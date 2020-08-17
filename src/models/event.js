const { withId, withTimestamp } = require('./mixins');
const asyncPipe = require('../lib/async-pipe');
import uuid from '../lib/uuid';
// const uuid = () => 'ID123';
const utc = () => new Date().toUTCString();

/**
 * @typedef {Object} Event
 * @property {Function} getEventName
 * @property {String} id
 * @property {String} eventType
 * @property {String} modelName
 */

const Event = (() => {

  const Event = ({ factory, args, eventType, modelName }) => {
    return Promise.resolve(
      factory(args)
    ).then(event => ({
      getEventName: () => eventType + modelName,
      eventType: eventType,
      modelName: modelName,
      ...event
    }));
  };

  const makeEvent = asyncPipe(
    Event,
    withTimestamp(utc),
    withId(uuid),
  );

  return {
    /**
     * 
     * @param {{factory: Function, args: any, eventType: String, modelName: String}} options 
     * @returns {Event}
     */
    create: async function (options) {
      return await makeEvent(options);
    }
  }
})();

export default Event;

// const factFunc = (val1) => {
//   return {
//     var1: val1,
//     isValid: function () {
//       return val1 !== 'undefined';
//     }
//   };
// }

// const m = Model.create({
//   factory: factFunc,
//   args: 'arg1',
//   modelName: 'model1'
// });
// console.log(m);
// console.log(`getModelName: ${m.getModelName()}`);
// console.log(`isValid: ${m.isValid()}`);

