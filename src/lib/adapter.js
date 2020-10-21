'use strict'

/**
 * Adapter for external interfaces.
 * @param {*} adaptee - adaptee object (this)
 */
const InterfaceAdapter = function (adaptee) {
  const adapters = new Map();
  return {
    /**
     * Add adapter logic
     * @param {function | string} iface - external interface
     * @param {function(Function):Promise<any>} adapter - adapter logic
     */
    add(iface, adapter) {
      adapters.set(iface, adapter);
    },
    /**
     * Invoke adapter logic
     * @param {function | string} iface - external interface
     */
    async invoke(iface) {
      return adapters.get(iface).call(adaptee, iface);
    }
  }
}

export default InterfaceAdapter;
