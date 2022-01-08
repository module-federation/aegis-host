'use strict'

import * as localClients from './providers'
//const getRemoteClients = async () => import('aegis-services/dns')

export const dns = async function () {
  const name = process.env.DNS_SERVICE
  // const remoteClients = await getRemoteClients()
  // if (!remoteClients)
  return localClients[name]
  //return remoteClients[name]
}

export * as whois from './whois'
