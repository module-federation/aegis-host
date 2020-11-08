import publishEvent from '../services/publish-event';
// import { Event } from '../services/event-service';


/**
 * 
 * @param {import('../lib/observer').Observer} observer 
 * @param {import('../adapters/event-adapter').EventService} eventService
 */
export default function handleEvents(observer) {
  observer.on('*', async event => publishEvent(event));
  // observer.on('*', async event => Event.notify(event.eventName, event));
}

