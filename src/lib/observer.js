/**
 * @typedef {import('../models/event').Event} Event
 */

/**
 * @callback eventHandler
 * @param {Event} event
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
   * @param {String} eventName   
   * @param {eventHandler} handler 
   */
  on(eventName, handler) {
    throw new Error('unimplemented abstract method');
  }
  /**
   *  
   * @param {String} eventName 
   * @param {Event} eventData 
   */
  async notify(eventName, eventData) {
    throw new Error('unimplemented abstract method');
  }
}

/**
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
   */
  on(eventName, handler) {
    if (eventName && typeof handler !== 'function') {
      throw new Error('eventName or handler invalid');
    }
    if (this._handlers.has(eventName)) {
      this._handlers.get(eventName).push(handler);
    } else {
      this._handlers.set(eventName, [handler]);
    }
  }

  /**
   * @override
   */
  async notify(eventName, eventData) {
    if (this._handlers.has(eventName)) {
      await Promise.all(this._handlers.get(eventName).map(
        async handler => await handler(eventData)
      ));
      if (eventName !== '*') {
        await this.notify('*', eventData);
      }
    } else if (eventName !== '*') {
      await this.notify('*', eventData);
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
    }
  });
})();

export default ObserverFactory;
