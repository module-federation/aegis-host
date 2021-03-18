"use strict";

/**
 *
 * @param {{notify:function(RegExp|string,string):Promise<void>}} eventService
 * @returns
 */
export default function forwardEvent(eventService) {
  return async function forward(topic, message) {
    try {
      eventService.notify(topic, message);
    } catch (error) {
      console.error(error);
    }
  };
}
