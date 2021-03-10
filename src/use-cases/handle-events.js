import publishEvent from "../services/publish-event";

/**
 *
 * @param {import('../models/observer').Observer} observer
 * @param {import('../adapters/event-adapter').EventService} eventService
 */
export default function handleEvents(observer) {
  observer.on(/.*/, async event => publishEvent(event, observer));
  // setTimeout(
  //   observer.notify("hotReload", {
  //     eventName: "hot-reload",
  //     eventType: "register-webhook",
  //     eventData: { url: "http://localhost:8070/restart" },
  //   }),
  //   30000
  // );
  // setInterval(
  //   () =>
  //     observer.notify("hotReload", {
  //       eventName: "hot-reload",
  //       eventType: "register-webhook",
  //       eventData: { url: "http://localhost:8070/restart" },
  //     }),
  //   30000
  // );
}
