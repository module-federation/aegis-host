
/**
 * Abstract observer
 */
export class Observer {
  /**
   * Register callback `handler` to fire on event `eventName`
   * @param {String} eventName   
   * @param {Function} handler 
   */
  on(eventName, handler) {
    throw new Error('unimplemented abstract method');
  }
  /**
   *  
   * @param {String} eventName 
   * @param {import('../models/event').Event} eventData 
   */
  async notify(eventName, eventData) {
    throw new Error('unimplemented abstract method');
  }
}

class ObserverImpl extends Observer {
  constructor(eventHandlers) {
    super();
    this._handlers = eventHandlers;
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
    }
  }
}


const ObserverFactory = (() => {
  let instance;

  function createInstance() {
    return new ObserverImpl(new Map());
  }

  return Object.freeze({
    /**
     * @returns {Observer} observer singleton
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
