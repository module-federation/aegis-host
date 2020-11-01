import publishEvent from '../services/publish-event';



/**
 * 
 * @param {import('../adapters/event-target').EventTargetAdapter} eventTarget 
 */
// export default function producerFactory(eventTarget) {
//   return async function produceEvent(topic, event) {
//     eventTarget.fireEvent(topic, event);
//   }
// }

/**
 * 
 * @param {import('../lib/observer').Observer} observer 
 */
export default function handleEvents(observer) {
  observer.on('*', async event => publishEvent(event));
}

