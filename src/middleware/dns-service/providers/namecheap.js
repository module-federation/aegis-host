'use strict'

export const DnsProvider = {
  createRecord: async (...args) => console.log('dns.createRecord', args),
  removeRecord: async (...args) => console.log('dns.removeRecord', args)
}
