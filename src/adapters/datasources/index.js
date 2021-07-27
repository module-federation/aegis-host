export * from "./datasource-memory";
export * from "./datasource-file";
export * from "./datasource-mongodb";
//export * from "./datasource-ipfs";
//export * from "./datasource-solid-pod";

const config = {
  /** available adapters */
  getBaseClass(name) {
    if (name === "DataSourceFile") {
      return require(".").DataSourceFile;
    }
    if (name === "DataSourceMongoDb") {
      return require(".").DataSourceMongoDb;
    }
    // if (name === "DataSourceIpfs") {
    //   return require(".").DataSourceIpfs;
    // }
    // if (name === "DataSourceSolidPod") {
    //   return require(".").DataSourceSolidPod;
    // }
    return require(".").DataSourceMemory;
  },
  /** Used for cache */
  MEMORY_ADAPTER: "DataSourceMemory",
};

export default config;
