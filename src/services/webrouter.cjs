"use strict";
const WebSocketServer = require("ws").Server;
const nanoid = require("nanoid").nanoid;
const server = new WebSocketServer({ clientTracking: true, port: 8062 });

server.broadcast = function (data, sender) {
  //
  server.webRoutes(sender).forEach(function (client) {
    client.send(data);
  });
};

server.on("connection", function (client) {
  client.webswitchId = nanoid();
  console.log("client connected", client.webswitchId);

  client.addListener("ping", function () {
    client.pong();
  });

  //
  // Server queries client to get its configuration so that it only sends
  // requests the client can fulfill vs blindly broadcasting.
  //
  // Also, server deduplicates responses by only sending to one of multiiple clients
  // possessing the same resources.
  //
  // Because WebSwitch understands the application architecture, there's no need for it to inspect
  // the contents of incoming and outgoing messages. The routes are set up ahead of time based on
  // the client config.
  //
  // Server also performs load balancing, based on resource avalability, distribution
  // and performance. Poorly performing clients/subnets are disused.
  //
  // Server analytics give recommendations about physical deployment options
  // and application configuration changes to optmize performance.
  //
  //
  // Server automation acts on these recommendations, allowing the app to be dynmically redeployed
  // to another network or datacenter or scaled out or reconfigured, e.g. so chatty or busy commponents
  // creating hot spots on the network are redeployed to run together in a single process, where they can
  // communicate directly via memory instead, or workload is dynamically redistributed across additional
  // nodes, including moving any data that's needed and streaming component code to instancess where it
  // isn't deployed.
  //
  //
  client.on("webroute", function (routes) {
    server.addWebRoutes(routes);
    client.initWebRoute();
  });

  client.on("close", function () {
    console.warn("client disconnecting", client.webswitchId);
  });

  client.on("message", function (message) {
    try {
      if (client.webswitchInit) {
        server.broadcast(message, client);
        return;
      }

      const msg = JSON.parse(message.toString());
      if (msg === "webswitch") {
        console.log("client initialized");
        client.webswitchInit = true;
        return;
      }
    } catch (e) {
      console.error(e);
    }

    client.terminate();
    console.log("terminated client", client.webswitchId);
  });
});
