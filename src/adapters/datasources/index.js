export * from "./datasource-memory";
export * from "./datasource-file";
export * from "./datasource-mongodb";
//export * from "./datasource-ipfs";
//export * from "./datasource-solid-pod";

const config = {
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
  MEMORYADAPTER: "DataSourceMemory",
};

export default config;
