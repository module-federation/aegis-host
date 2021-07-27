"use strict";
const WebSocketServer = require("ws").Server;
const nanoid = require("nanoid").nanoid;
const server = new WebSocketServer({ clientTracking: true, port: 8062 });
let messagesSent = 0;
const startTime = Date.now();

function uptime() {
  const minutes = Math.round(Math.abs((Date.now() - startTime) / 1000 / 60));
  const hours = minutes > 60 ? (minutes / 60).toFixed(1) : 0;
  const days = minutes > 60 * 24 ? (minutes / (60 * 24)).toFixed(1) : 0;
  return {
    minutes,
    hours,
    days,
  };
}

server.broadcast = function (data, sender) {
  server.clients.forEach(function (client) {
    if (client.OPEN && client.webswitchId !== sender.webswitchId) {
      console.debug("sending to client", client.webswitchId);
      client.send(data);
      messagesSent++;
    }
  });
};

server.sendStatus = function (client) {
  client.send(
    JSON.stringify({
      uptime: uptime(),
      messagesSent,
      clientsConnected: server.clients.size,
    })
  );
};

server.on("connection", function (client) {
  client.webswitchId = nanoid();
  console.log("client connected", client.webswitchId);

  client.addListener("ping", function () {
    client.pong();
  });

  client.on("close", function () {
    console.warn("client disconnecting", client.webswitchId);
  });

  client.on("message", function (message) {
    try {
      const msg = JSON.parse(message.toString());
      if (client.webswitchInit) {
        if (msg == "status") {
          return server.sendStatus(client);
        }
        server.broadcast(message, client);
        return;
      }

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

  process.on("SIGTERM", () => {
    console.info("Shuttiing down. Closing clients.");
    server.clients.forEach(client => client.close("SIGTERM"));
  });
});
