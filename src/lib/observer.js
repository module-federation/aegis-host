/**
 * @typedef {import('../models/event').Event} Event
 * @typedef {import('../models').Model} Model
 */

/**
 * @callback eventHandler
 * @param {Event | Model | *} eventData
 */

/**
 * Abstract observer
 */
export class Observer {
  /**
   *
   * @param {Map<string, eventHandler[]>} eventHandlers
   */
  constructor(eventHandlers) {
    this._handlers = eventHandlers;
  }

  /**
   * Register callback `handler` to fire on event `eventName`
   * @param {String | RegExp} eventName
   * @param {eventHandler} handler
   * @param {boolean} [allowMultiple] - true by default; if false, event handled only once
   */
  on(eventName, handler, allowMultiple = true) {
    throw new Error("unimplemented abstract method");
  }
  /**
   * Fire event `eventName` and pass `eventData` to listeners.
   * @param {String} eventName
   * @param {Event} eventData
   */
  async notify(eventName, eventData) {
    throw new Error("unimplemented abstract method");
  }
}

/**
 * @type {Observer}
 * @extends Observer
 */
class ObserverImpl extends Observer {
  /**
   * @override
   */
  constructor(eventHandlers) {
    super(eventHandlers);
  }

  /**
   * @override
   *
   */
  on(eventName, handler, allowMultiple = true) {
    if (!eventName || typeof handler !== "function") {
      throw new Error("eventName or handler invalid");
    }
    if (this._handlers.has(eventName)) {
      if (allowMultiple) {
        this._handlers.get(eventName).push(handler);
      }
    } else {
      this._handlers.set(eventName, [handler]);
    }
  }

  /**
   * @override
   */
  async notify(eventName, eventData) {
    if (this._handlers.has(eventName)) {
      await Promise.all(
        this._handlers.get(eventName).map(async (handler) => handler(eventData))
      ).catch((reason) => {
        console.error(reason);
      });
      if (eventName !== "*") {
        await this.notify("*", eventData);
      }
    } else if (eventName !== "*") {
      await this.notify("*", eventData);
    }
  }
}

/**
 * Observer is a singleton
 */
const ObserverFactory = (() => {
  let instance;

  function createInstance() {
    return new ObserverImpl(new Map());
  }

  return Object.freeze({
    /**
     * @returns {Observer} singleton
     */
    getInstance: function () {
      if (!instance) {
        instance = createInstance();
      }
      return instance;
    },
  });
})();

export default ObserverFactory;
