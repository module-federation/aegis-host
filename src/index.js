"use strict";
const express = require("express");
const app = express();
const remoteEntry = require("./remoteEntry");
require("regenerator-runtime");
const PORT = 8070;

app.use(express.json());
app.use(express.static("public"));

function startMicroLib() {
  remoteEntry.microlib.get("./server").then(factory => {
    const Module = factory();
    Module.default.start(app);
  });
}
startMicroLib();

app.get("/restart", () => {
  Object.keys(require.cache)
    .filter(k => /src|webpack|container/.test(k))
    .forEach(k => delete cache.require[k]);
  startMicroLib();
});

app.listen(PORT, function () {
  console.log(`\n🌎 Server listening on http://localhost:${PORT} 🌎\n`);
});

// import("./remoteEntry")
//   .then(x => x.microlib.get("./server"))
//   .then(factory => {
//     const Module = factory();
//     console.log(Module);
//   });

// app.use(express.json());
// app.use(express.static("public"));

// app.use("/", (req,res) => {
//   require("./remoteEntry")(req, res, express);
// });

// app.use("/restart", (req, res) => {
//   // TODO: check credentials first, need admin claim in jwt
//   Object.keys(require.cache)
//     .filter(k => /src|webpack/.test(k))
//     .forEach(k => delete require.cache[k]);

// });

// Server.start(app);

// app.listen(PORT, function () {
//   chalk.blue(`\n🌎 Server listening on http://localhost:${PORT} 🌎\n`);
// });

// const app = require("express");
// const server = require("server")

// const express = require("express");
// const chalk = require("chalk");
// const initMiddleware = require("./middleware");

// const { raw: env } = require("../build/env")();

// const app = express();

// /**
//  * All application expressjs middleware
//  */
// // likely dont need to track running server since im not stopping express, but webpack.
// // might be useful to time the restart for when whatever the current request is complete
// let runningServer;
// const done = () => {
//   runningServer = app.listen(env.PORT, () => {
//     console.info(
//       `[${new Date().toISOString()}]`,
//       chalk.blue(`App is running: 🌎 http://localhost:${env.PORT}`)
//     );
//   });
// };

// app.use("/restart", (req, res) => {
//   process.on("exit", function () {
//     require("child_process").spawn(process.argv.shift(), process.argv, {
//       cwd: process.cwd(),
//       detached: false,
//       stdio: "inherit",
//     });
//   });

//   res.status = 200;
//   res.send();
//   res.on("finish", function () {
//     console.log("OK response sent, killing and restarting application");

//     process.exit();
//   });

//   //   var wipeCache = require('wipe-webpack-cache');
//   //   function resolver(stubs, fileName, module) {
//   //     return true
//   //   }
//   // console.log(__webpack_require__.hmrD);
//   // module.hot.dispose()
//   // module.hot.invalidate()
//   // module.hot.accept(module.id,initMiddleware)
//   // module.hot.addStatusHandler(()=>{
//   //   return 'ready'
//   // })
//   // module.hot.addDisposeHandler(()=>{
//   //   console.log(module.hot.status())
//   // })
//   //

//   // module.hot.apply(()=>{})
//   // wipe everything, except node_modules

//   //
//   // for (var moduleId in __non_webpack_require__.cache) {
//   //   delete __non_webpack_require__.cache[moduleId];
//   // }
//   //
//   // for (var moduleId in require.cache) {
//   //   delete require.cache[moduleId];
//   // }
//   // app.close();
//   // const resolved = __non_webpack_require__.resolve('../src/external.js')
//   // delete __non_webpack_require__.cache[resolved]
//   // delete require.cache[require.resolve('special')]
//   //
//   // console.log(__non_webpack_require__.cache);
//   // delete require.cache[require.resolve('./index')]
//   // require('./index');
//   //
//   // const cpecial = require('special')
//   // cpecial()
//   // res.status = 200
//   // res.end()
// });
// if (module.hot) {
//   // module.hot.dispose(console.log)
//   module.hot.accept("./index", () => {
//     console.log("is hot reloading");
//     // eslint-disable-next-line
//     require("./index");
//   });
// }
// console.log("basline app");
// initMiddleware(express, app, done);

// module.exports = app;
