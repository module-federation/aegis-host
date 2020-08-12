import DataSource from "./datasource";

let inMemoryDataSource;

export default class DataSource1 extends DataSource {

  constructor() {
    inMemoryDataSource = new Map();
    super();
  }

  async save(data) {
    inMemoryDataSource.set(data.id, data);
  }

  async find(id) {
    return inMemoryDataSource.get(id);
  }

  async list() {
    return [...inMemoryDataSource.entries()];
  }

}