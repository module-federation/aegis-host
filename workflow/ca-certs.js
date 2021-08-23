

/** @type {import("../src/domain").ModelSpecification} */
const CACert = {
  modelName: "cacert",
  endpoint: "workflow",
  ports: {
    requestCerts: {
      service: "CertificateAuthority",
      type: "outbound",
      keys: ["fullchain", "privkey"],
      consumesEvent: "requestCert",
      producesEvent: "certReceived",
    },
    installCerts: {
      service: "WriteFile",
      type: "inbound",
      keys: ["fullchain", "privkey"],
      consumesEvent: "certReceived",
      producesEvent: "workflowComplete",
    },
  },
}

module.exports = CACert;
