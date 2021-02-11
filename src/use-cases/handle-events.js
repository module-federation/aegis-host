import publishEvent from "../services/publish-event";

/**
 *
 * @param {import('../lib/observer').Observer} observer
 * @param {import('../adapters/event-adapter').EventService} eventService
 */
export default function handleEvents(observer) {
  observer.on(".*", async event => publishEvent(event));
}
