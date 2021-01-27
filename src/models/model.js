"use strict";

/**
 * @typedef {Object} Model Domain entity/service object - conforms to `ModelSpecification`
 * @property {string} Symbol_id - immutable/private model instance uuid
 * @property {string} Symbol_modelName - immutable/private model name
 * @property {string} Symbol_createTime - immutable/private time of creation
 * @property {string} Symbol_updateTime - immutable/private time of last update
 * @property {function(*,Model):Model} Symbol_onUpdate - immutable/private update function
 * @property {function(Model)} Symbol_onDelete - immutable/private delete function
 * @property {function(Object)} update - use this function to update the model -
 * specify changes as properties of an object
 * @property {function()} toJSON - de/serialization logic
 * @property {function(eventName,function(eventName,Model):void)} addListener listen
 * for domain events
 * @property {function(eventName,Model):Promise<void>} emit emit a domain event
 * @property {import('./mixins').functionalMixin} [mixinMethod] - when the user
 * specifies a mixin, it is applied to the model on creation - adding methods is
 * a common result.
 * @property {*} [mixinData] - when the user specifies a mixin, it is applied to
 * the model on creation - adding fields is a common result.
 * @property {function(function():Promise<Model>):Promise<Model>} [port] - when a
 * port is configured, the framework generates a method on the model object to invoke it.
 * When data arrives on the port, the port's adapter invokes the callback specified
 * in the port configuration, which is passed as an argument to the port function.
 * The callback returns an updated `Model`, and control is returned to the caller.
 * Optionally, an event is fired to trigger the next port function to run
 * @property {function():Promise<any>} [relation] - when you configure a relation,
 * the framework generates a function that your code calls to run the query
 * @property {function(*):*} [command] - the framework will call any model method
 * you specify when passed as a parameter or query in an API call.
 */

import {
  withTimestamp,
  withSerializers,
  withDeserializers,
  fromTimestamp,
  fromSymbol,
  toSymbol,
} from "./mixins";
import makePorts from "./make-ports";
import makeRelations from "./make-relations";
import compensate from "./compensate";
import asyncPipe from "../lib/async-pipe";
import compose from "../lib/compose";
import pipe from "../lib/pipe";
import uuid from "../lib/uuid";

/**
 * @namespace
 */
const Model = (() => {
  // Render immutable w/ local symbols
  const ID = Symbol("id");
  const MODELNAME = Symbol("modelName");
  const CREATETIME = Symbol("createTime");
  const UPDATETIME = Symbol("updateTime");
  const ONUPDATE = Symbol("onUpdate");
  const ONDELETE = Symbol("onDelete");
  const VALIDATE = Symbol("validate");
  const PORTFLOW = Symbol("portFlow");

  const keyMap = {
    id: ID,
    modelName: MODELNAME,
    createTime: CREATETIME,
    updateTime: UPDATETIME,
    onUpdate: ONUPDATE,
    onDelete: ONDELETE,
    validate: VALIDATE,
    portFlow: PORTFLOW,
  };

  /**
   * bitmask for identying events
   */
  const eventMask = {
    update: 1, //  0001 Update
    create: 1 << 1, //  0010 Create
    onload: 1 << 2, //  0100 Load
  };

  const defaultOnUpdate = (model, changes) => {
    return model;
  };

  const defaultOnDelete = model => {
    return { ...withTimestamp("deleteTime")(model) };
  };

  const defaultValidate = (model, changes) => {
    return model;
  };

  /**
   * Add data and functions that support framework services.
   * @param {{
   *  model:Model,
   *  spec:import('./index').ModelSpecification
   * }} param0
   */
  function make({
    model,
    spec: {
      ports,
      observer,
      modelName,
      datasource,
      mixins = [],
      dependencies,
      relations = {},
      onUpdate = defaultOnUpdate,
      onDelete = defaultOnDelete,
      validate = defaultValidate,
    },
  }) {
    return {
      // Optional mixins
      ...compose(...mixins)(model),
      // Generate functions to fetch related objects
      ...makeRelations(model, relations, datasource),
      // Create ports for domain I/O
      ...makePorts(ports, dependencies, observer),
      // Remember port calls
      [PORTFLOW]: [],
      // model class name
      [MODELNAME]: modelName,
      // model instance uuid
      [ID]: uuid(),
      // Called before update is committed
      [ONUPDATE](changes) {
        return onUpdate(this, changes);
      },
      // Called before delete is committed
      [ONDELETE]() {
        return onDelete(this);
      },
      [VALIDATE](changes, event) {
        return validate(this, changes, event);
      },
      // Back out all port transactions
      async undo() {
        compensate(this, ports);
      },
      /**
       * User code calls this to persist any updates it makes.
       * @param {*} changes
       */
      async update(changes) {
        const correct = this[VALIDATE](changes, eventMask.update);
        const updated = await datasource.save(model[ID], {
          ...correct,
          [UPDATETIME]: new Date().getTime(),
        });
        return updated;
      },
      /**
       * Listen for domain events.
       * @param {string} eventName - name of event
       * @param {function(Model)} callback - called when event is heard
       * @param {boolean} [multi] - allow multiple listeners for event,
       * defaults to `true`
       */
      addListener(eventName, callback, multi) {
        observer.on(eventName, callback, multi);
      },
      /**
       * Emit domain events.
       * @param {string} eventName - event identifier, unique string
       * @param {*} eventData - any, buy typically `Model`
       */
      async emit(eventName, eventData) {
        await observer.notify(eventName, eventData);
      },
    };
  }

  /**
   * Call the model's factory function to generate a model instance.
   * Pass the caller's input as arguments to the function. Then call
   * `make` to enrich the model with ports, relations, commands, user
   * mixins, etc.
   * @lends Model
   * @namespace
   * @class
   * @param {{
   *  args: any[],
   *  spec: import('./index').ModelSpecification
   * }} modelInfo
   */
  const Model = async modelInfo =>
    Promise.resolve(
      // Call factory
      modelInfo.spec.factory(...modelInfo.args)
    ).then(model =>
      make({
        model,
        spec: modelInfo.spec,
      })
    );

  const validate = event => model => model[VALIDATE]({}, event);

  // Create model instance
  const makeModel = asyncPipe(
    Model,
    validate(eventMask.create),
    withTimestamp(CREATETIME),
    withSerializers(
      fromSymbol(keyMap),
      fromTimestamp(["createTime", "updateTime"])
    ),
    withDeserializers(toSymbol(keyMap)),
    Object.freeze
  );

  // Recreate model instance
  const loadModel = pipe(
    make,
    validate(eventMask.onload),
    withSerializers(
      fromSymbol(keyMap),
      fromTimestamp(["createTime", "updateTime"])
    ),
    withDeserializers(toSymbol(keyMap)),
    Object.freeze
  );

  return {
    /**
     * Create a new model instance
     * @param {{
     *  spec: import('./index').ModelSpecification
     *  args: any[]
     * }} modelInfo
     * @returns {Promise<Readonly<Model>>}
     */
    create: async modelInfo => makeModel(modelInfo),

    /**
     * Load a saved model
     * @param {Model} savedModel deserialized model
     * @param {import('../models').ModelSpecification} spec
     */
    load: modelInfo => loadModel(modelInfo),

    /**
     * Process update request.
     * (Invokes user-provided `onUpdate` callback.)
     * @param {Model} model - model instance to update
     * @param {Object} changes - Object containing changes
     * @returns {Model} updated model
     *
     */
    update: function (model, changes) {
      const correct = model[VALIDATE](changes, eventMask.update);
      const updates = {
        ...correct,
        [UPDATETIME]: new Date().getTime(),
      };
      return updates;
    },

    /**
     *
     * @param {Model} model
     * @param {*} changes
     */
    validate: (model, changes) => model[VALIDATE](changes),

    /**
     * Process delete request.
     * (Invokes provided `onDelete` callback.)
     * @param {Model} model
     * @returns {Model}
     */
    delete: model => model[ONDELETE](),

    /**
     * Get private symbol for `key`
     * @param {string} key
     * @returns {Symbol} unique symbol
     */
    getKey: key => keyMap[key],

    /**
     * Get model ID
     * @param {Model} model
     * @returns {string} model's ID
     */
    getId: model => model[ID],

    /**
     * Get model name
     * @param {Model} model
     * @returns {string} model's name
     */
    getName: model => model[MODELNAME],

    /**
     * History of port invocation
     */
    getPortFlow: model => model[PORTFLOW],
  };
})();

export default Model;
