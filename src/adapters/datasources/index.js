export * from "./datasource-memory";
export * from "./datasource-file";
export * from "./datasource-mongodb";

const config = {
  getBaseClass(name) {
    if (name === "DataSourceFile") {
      return require(".").DataSourceFile;
    }
    if (name === "DataSourceMongoDb") {
      return require(".").DataSourceMongoDb;
    }
    return require(".").DataSourceMemory;
  },
  MEMORYADAPTER: "DataSourceMemory",
};

export default config;
