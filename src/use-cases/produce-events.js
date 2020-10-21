import publishEvent from '../services/publish-event';

/**
 * 
 * @param {import('../lib/observer').Observer} observer 
 */
export default function (observer) {
  observer.on('*', async event => publishEvent(event));
}

