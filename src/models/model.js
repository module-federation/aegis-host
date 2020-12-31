"use strict";

import {
  withId,
  withTimestamp,
  withSymbolsInJSON
} from "./mixins";
import makePorts from "./make-ports";
import compensate from "./compensate";
import asyncPipe from "../lib/async-pipe";
import compose from "../lib/compose";
import uuid from "../lib/uuid";
import ObserverFactory from "../lib/observer";
import pipe from "../lib/pipe";

/**
 * @namespace
 */
const Model = (() => {
  // Render immutable w/ local symbols
  const ID = Symbol("id");
  const MODELNAME = Symbol("modelName");
  const CREATETIME = Symbol("createTime");
  const ONUPDATE = Symbol("onUpdate");
  const ONDELETE = Symbol("onDelete");
  const PORTFLOW = Symbol("portFlow");

  const keyMap = {
    id: ID,
    modelName: MODELNAME,
    createTime: CREATETIME,
    onUpdate: ONUPDATE,
    onDelete: ONDELETE,
    portFlow: PORTFLOW,
  };

  const defUpdate = (model, changes) => ({
    ...model,
    ...changes,
  });

  const defDelete = (model) => ({
    ...withTimestamp("deleteTime")(model),
  });

  const observer = ObserverFactory.getInstance();

  function make({
    model,
    spec: {
      ports,
      modelName,
      mixins = [],
      dependencies,
      onUpdate = defUpdate,
      onDelete = defDelete,
    },
  }) {
    return {
      ...model,
      // Track port calls
      [PORTFLOW]: [],
      // Create ports for domain I/O
      ...makePorts.call(model, ports, dependencies, observer),
      // Orchestration undo logic
      compensate: compensate.call(model, ports),
      // Optional mixins
      ...compose(...mixins)(model),
      // Immutable props...
      [ONUPDATE](changes) {
        return onUpdate(this, changes);
      },
      [ONDELETE]() {
        return onDelete(this);
      },
      [MODELNAME]: modelName,
    };
  }

  /**
   * Call factory with user input, generate port functions
   * and compose functional mixins to create model.
   * @lends Model
   * @namespace
   * @class
   * @param {{
   *  args: any[],
   *  spec: import('./index').ModelSpecification
   * }} modelInfo
   */
  const Model = async (modelInfo) =>
    Promise.resolve(
      // Call factory
      modelInfo.spec.factory(...modelInfo.args)
    ).then((model) => make({
      model,
      spec: modelInfo.spec
    }));

  // Add common behavior & data
  const makeModel = asyncPipe(
    Model,
    withTimestamp(CREATETIME),
    withId(ID, uuid),
    withSymbolsInJSON(keyMap),
    Object.freeze
  );

  const loadModel = pipe(
    make,
    withSymbolsInJSON(keyMap, true),
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
    create: async (modelInfo) => makeModel(modelInfo),

    /**
     * Invoked when loading saved models
     * @param {Model} savedModel deserialized model
     * @param {import('../models').ModelSpecification} spec
     */
    load: function (modelInfo) {
      return loadModel({
        model: {
          ...modelInfo.model,
          isLoading: true
        },
        spec: {
          ...modelInfo.spec
        },
      });
    },

    /**
     * Process model update request.
     * (Invokes user-provided `onUpdate` callback.)
     * @param {Model} model - model instance to update
     * @param {Object} changes - Object containing changes
     * @returns {Model} updated model
     *
     */
    update: function (model, changes) {
      const updates = {
        ...changes,
        isLoading: false
      };
      return model[ONUPDATE](updates);
    },

    /**
     * Process model delete request.
     * (Invokes provided `onDelete` callback.)
     * @param {Model} model
     * @returns {Model}
     */
    delete: (model) => model[ONDELETE](),

    /**
     * Get private symbol for `key`
     * @param {string} key
     * @returns {Symbol} unique symbol
     */
    getKey: (key) => keyMap[key],

    /**
     * Get model ID
     * @param {Model} model
     * @returns {string} model's ID
     */
    getId: (model) => model[ID],

    /**
     * Get model name
     * @param {Model} model
     * @returns {string} model's name
     */
    getName: (model) => model[MODELNAME],

    /**
     * History of port invocation
     */
    getPortFlow: (model) => model[PORTFLOW],
  };
})();

export default Model;