'use strict'

import { nanoid } from 'nanoid'

const SERVICENAME = 'webswitch'
const startTime = Date.now()
const uptime = () => Math.round(Math.abs((Date.now() - startTime) / 1000 / 60))
const configRoot = require('../../../../public/aegis.config.json')
const config = configRoot.services.serviceMesh.WebSwitch
const DEBUG = /true/i.test(config.debug)
const isSwitch = /true/i.test(process.env.IS_SWITCH) || config.isSwitch
let messagesSent = 0
let backupSwitch

/**
 *
 * @param {import('ws').Server} server
 * @returns {import('ws').Server}
 */
export function attachServer (server) {
  /**
   * @param {object} data
   * @param {WebSocket} sender
   */
  server.broadcast = function (data, sender) {
    server.clients.forEach(function (client) {
      if (client.OPEN && client !== sender) {
        console.assert(!DEBUG, 'sending client', client.info, data.toString())
        client.send(data)
        messagesSent++
      }
    })

    if (server.uplink && server.uplink !== sender) {
      server.uplink.publish(data)
      messagesSent++
    }
  }

  /**
   * @todo implement rate limit enforcement
   * @param {WebSocket} client
   */
  server.setRateLimit = function (client) {}

  function statusReport () {
    return JSON.stringify({
      servicePlugin: SERVICENAME,
      uptimeMinutes: uptime(),
      messagesSent,
      clientsConnected: server.clients.size,
      uplink: server.uplink ? server.uplink.info : 'no uplink',
      isPrimarySwitch: isSwitch,
      clients: [...server.clients].map(c => ({ ...c.info, OPEN: c.OPEN }))
    })
  }

  /**
   *
   * @param {WebSocket} client
   */
  server.sendStatus = function (client) {
    client.send(statusReport())
  }

  server.reassignBackupSwitch = function (client) {
    if (client.info.id === backupSwitch) {
      for (let c of server.clients) {
        if (
          c.info.id !== backupSwitch &&
          c.info.role === 'node' &&
          c.info.isSwitch === false
        ) {
          backupSwitch = c.info.id
          c.isBackupSwitch = true
          return
        }
      }
    }
  }

  /**
   * @param {WebSocket} client
   */
  server.on('connection', function (client) {
    client.info = { address: client._socket.address(), id: nanoid() }

    client.addListener('ping', function () {
      console.assert(!DEBUG, 'responding to client ping', client.info)
      client.pong(0xa)
    })

    client.on('close', function () {
      console.warn('client disconnecting', client.info)
      if (client.info.role === 'node') {
        server.reassignBackupSwitch(client)
        server.broadcast(statusReport(), client)
      }
    })

    client.on('error', function (error) {
      console.error(error)
    })

    client.on('message', function (message) {
      try {
        const msg = JSON.parse(message.toString())

        if (client.info.initialized) {
          if (msg == 'status') {
            server.sendStatus(client)
            return
          }
          server.broadcast(message, client)
          return
        }

        if (msg.proto === SERVICENAME) {
          if (!backupSwitch && isSwitch && msg.role === 'node')
            backupSwitch = client.info.id
          client.info = {
            ...msg,
            initialized: true,
            isBackupSwitch: backupSwitch === client.info.id
          }
          console.info('client initialized', client.info)
          client.send(JSON.stringify({ ...msg, ...client.info }))
          return
        }
      } catch (e) {
        console.error(client.on.name, 'on message', e)
      }

      client.terminate()
      console.warn('terminated client', client.info)
    })

    //server.broadcast(statusReport(), client)
  })

  try {
    if (config.uplink) {
      /** @type {import('./node')} */
      const uplink = require('./node')
      server.uplink = uplink
      uplink.setUplinkUrl(config.uplink)
      uplink.onUplinkMessage(msg => server.broadcast(msg, uplink))
      uplink.connect()
    }
  } catch (e) {
    console.error('uplink', e)
  }

  return server
}
