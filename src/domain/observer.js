/**
 * @typedef {import('./event').Event} Event
 * @typedef {import('.').Model} Model
 */

/**
 * @callback eventHandler
 * @param {Event | Model | {eventName:string, Model}} eventData
 * @returns {Promise<void>}
 */

/**
 *
 * @param {Error} error
 */
const handleError = error => {
  console.error({ file: __filename, error });
};

/**
 * Abstract observer
 */
export class Observer {
  /**
   *
   * @param {Map<string | RegExp, eventHandler[]>} eventHandlers
   */
  constructor(eventHandlers) {
    this.handlers = eventHandlers;
  }

  /**
   * Register callback `handler` to fire on event `eventName`
   * @param {String | RegExp} eventName
   * @param {eventHandler} handler
   * @param {boolean} [allowMultiple] - true by default; if false, event can be handled by only one callback
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
   * @param {string | RegExp} eventName
   * @param {eventHandler} handler
   * @param {boolean} [allowMultiple]
   */
  on(eventName, handler, allowMultiple = true) {
    if (!eventName || typeof handler !== "function") {
      throw new Error("eventName or handler invalid");
    }

    if (this.handlers.has(eventName)) {
      if (allowMultiple) {
        this.handlers.get(eventName).push(handler);
      }
    } else {
      this.handlers.set(eventName, [handler]);
    }
  }

  /**
   * @override
   */
  async notify(eventName, eventData) {
    try {
      if (this.handlers.has(eventName)) {
        await Promise.allSettled(
          this.handlers.get(eventName).map(handler => handler(eventData))
        );
      }

      await Promise.allSettled(
        [...this.handlers]
          .filter(([k, v]) => k instanceof RegExp && k.test(eventName))
          .map(([k, v]) => v.map(f => f(eventData)))
      );
    } catch (error) {
      handleError(error);
    }
  }
}

/**
 * @todo handle all state same way
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
