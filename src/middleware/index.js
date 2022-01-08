export * as AuthorizationService from './auth'
export * as ClusterService from './cluster'

import { dns, whois } from './dns-service'
export const DnsService = dns
export const WhoIsService = whois

import { initCertificateService } from './ca-cert'
export const CertificateService = {
  provisionCert: initCertificateService(dns, whois)
}

import * as MeshServices from './service-mesh'

const config = require('../../public/aegis.config.json')
const designatedService = config.services.activeServiceMesh

/**
 * Which mesh service implementations are enabled?
 */
const enabledServices = Object.entries(config.services.serviceMesh)
  .filter(([, v]) => v.enabled)
  .map(([k]) => k) || ['WebSwitch']

/**
 * Which mesh se....../rvice do we use?
 */
const service = enabledServices.includes(designatedService)
  ? designatedService
  : 'WebSwitch'

export const ServiceMeshPlugin = MeshServices[service]
