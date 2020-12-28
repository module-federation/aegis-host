"use strict";

import DataSource from "../datasources";
import Model from "../models/model";

export const Persistence = {
  async save(model) {
    return DataSource.getDataSource(Model.getName(model)).save(
      Model.getId(model),
      model
    );
  },

  async find(model) {
    return DataSource.getDataSource(Model.getName(model)).find(
      Model.getId(model)
    );
  },

  findModel(model) {
    const current = this.find(model);
    if (current) {
      return current;
    }
    return model;
  },

  async update(model, changes) {
    const current = await this.findModel(model);
    const updated = Model.update(current, changes);
    await this.save(updated);
    return updated;
  },

  close() {
    DataSource.close();
  },
};
