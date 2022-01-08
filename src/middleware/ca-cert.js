'use strict'

const acme = require('acme-client')
const fs = require('fs')
const path = require('path')
const config = require('../../public/aegis.config.json')
const dirname = config.services.cert.webRoot || 'public'
const webroot = path.resolve('./', dirname)
const domain = process.env.DOMAIN || config.services.cert.domain
const email = config.services.cert.domainEmail

const challengePath = token => `${webroot}/.well-known/acme-challenge/${token}`

/**
 * Function used to satisfy an ACME challenge
 *
 * @param {object} authz Authorization object
 * @param {object} challenge Selected challenge
 * @param {string} keyAuthorization Authorization key
 * @returns {Promise}
 */
function makeChallengeCreateFn (dnsProvider) {
  return async function challengeCreateFn (authz, challenge, keyAuthorization) {
    console.log('Triggered challengeCreateFn()')

    // http-01
    if (challenge.type === 'http-01') {
      const filePath = challengePath(challenge.token)
      console.log(`writing "${keyAuthorization}" to path "${filePath}"`)

      fs.writeFileSync(filePath, keyAuthorization)
      const data = fs.readFileSync(filePath, 'utf-8')
      console.log('file exists', data.toString())
    } else if (challenge.type === 'dns-01') {
      // dns-01
      const dnsRecord = `_acme-challenge.${authz.identifier.value}`

      console.log(
        `Create TXT record "${dnsRecord}" with value "${keyAuthorization}"`
      )
      const provider = await dnsProvider()
      await provider.createRecord(dnsRecord, 'TXT', keyAuthorization)
    }
  }
}

/**
 * Function used to remove an ACME challenge response
 *
 * @param {object} authz Authorization object
 * @param {object} challenge Selected challenge
 * @param {string} keyAuthorization Authorization key
 * @returns {Promise}
 */
function makeChallengeRemoveFn (dnsProvider) {
  return async function challengeRemoveFn (authz, challenge, keyAuthorization) {
    console.log('Triggered challengeRemoveFn()')

    // http-01
    if (challenge.type === 'http-01') {
      const filePath = challengePath(challenge.token)

      console.log(
        `Removing challenge response for ${authz.identifier.value} at path: ${filePath}`
      )
      fs.unlinkSync(filePath)
    } else if (challenge.type === 'dns-01') {
      // dns-01
      const dnsRecord = `_acme-challenge.${authz.identifier.value}`

      console.log(
        `Removing TXT record "${dnsRecord}" with value "${keyAuthorization}"`
      )
      const provider = await dnsProvider()
      await provider.removeRecord(dnsRecord, 'TXT')
    }
  }
}

async function getEmail (whois, domain) {
  try {
    return (await whois(domain)).getEmail()
  } catch (e) {
    console.log('whois getEmail', e.message)
  }
  return config.services.cert.domainEmail
}

const directoryUrl = !/prod/.test(process.env.NODE_ENV)
  ? acme.directory.letsencrypt.staging
  : acme.directory.letsencrypt.production

/**
 * Provide DNS client and WHOIS implementations
 * @param {import('./dns-service/dns-provider').DnsProvider} dnsProvider
 * @param {function(domain):{getEmail:function()}} whois
 * @returns {function(domain,email?,challengePath?):Promise<string>}
 */
exports.initCertificateService = function (dnsProvider, whois) {
  /**
   * Provision/renew CA cert
   */
  return async function provisionCert (domain, email = null) {
    try {
      // Init client
      const client = new acme.Client({
        directoryUrl,
        accountKey: await acme.forge.createPrivateKey()
      })

      // Create CSR
      const [key, csr] = await acme.forge.createCsr({
        commonName: domain
      })

      // Get certificate
      const cert = await client.auto({
        csr,
        email: email || (await getEmail(whois, domain)),
        termsOfServiceAgreed: true,
        challengeCreateFn: makeChallengeCreateFn(dnsProvider),
        challengeRemoveFn: makeChallengeRemoveFn(dnsProvider)
      })
      console.log(`CSR:\n${csr.toString()}`)
      console.log(`Private key:\nREDACTED`)
      console.log(`Certificate:\n${cert.toString()}`)

      return { key, cert, csr }
    } catch (e) {
      console.error(acme.Client.name, e)
    }
  }
}
