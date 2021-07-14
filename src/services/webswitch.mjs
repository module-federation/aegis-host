/**
 * WEBSWITCH (c)
 * websocket clients connect to a common server,
 * which broadcasts any messages it receives.
 * 
 * 
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
 */
"use strict";

import WebSocket from "ws";
import dns from "dns/promises";

const FQDN = process.env.WEBSWITCH_HOST || "webswitch.aegis.dev";
const PORT = 8062;
const PATH = "/webswitch/broadcast";

async function lookup(hostname) {
  try {
    const result = await dns.lookup(hostname);
    console.debug("server address", result, result.address);
    return result.address;
  } catch (error) {
    console.warn("dns lookup", error);
  }
  return null;
}

async function getHostName() {
  const hostname = await lookup(FQDN);
  return hostname ? hostname : "localhost";
}

/**@type import("ws/lib/websocket") */
let ws;

export async function publishEvent(event) {
  if (!event) return;

  const hostname = await getHostName();
  const serializedEvent = JSON.stringify(event);

  function webswitch() {
    console.debug("webswitch sending", event);

    if (!ws) {
      ws = new WebSocket(`ws://${hostname}:${PORT}${PATH}`);

      ws.on("message", function (message) {
        console.debug(message);
        const event = JSON.parse(message);
        // console.debug(event);
      });

      ws.on("open", function () {
        ws.send(JSON.stringify("webswitch"));
      });

      ws.on("error", function (error) {
        console.error("webswitchClient.on(error)", error);
      });
      return;
    }

    function send() {
      if (ws.readyState) {
        ws.send(serializedEvent);
        return;
      }
      setTimeout(() => send(), 1000);
    }

    send();
  }

  try {
    webswitch();
  } catch (e) {
    console.warn(publishEvent.name, e.message);
  }
}

publishEvent("webswitch");
