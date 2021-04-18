// var assert = require("assert");
// import DataSourceFactory from "../../src/datasources";
// import ObserverFactory from "../../src/lib/observer";
// import ModelFactory from "../../src/models/model-factory";
// import checkAcl from "../../src/lib/check-acl";

// const {
//   default: executeCommand,
// } = require("../../src/use-cases/execute-command");

// describe("executeCommand()", function () {
//   it("should add new model", async function () {
//     const spec = {
//       modelName: "test",
//       endpoint: "tests",
//       factory: () => ({ decrypt: () => console.log("decrypted") }),
//       commands: {
//         decrypt: {
//           command: "decrypt",
//           acl: "read",
//         },
//       },
//     };

//     ModelFactory.registerModel(spec);

//     var m = await ModelFactory.createModel(
//       ObserverFactory.getInstance(),
//       DataSourceFactory.getDataSource("TEST"),
//       "TEST",
//       [1, 2, 3]
//     );
//     //checkAcl(spec.commands[query.command].acl, permission)
//     console.log(m);
//     await executeCommand(ModelFactory, m, { command: "decrypt" }, "*");
//   });
// });
