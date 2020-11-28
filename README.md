# Composable Microservices

Using module federation (a la Zack Jackson) and clean architecture (a la Uncle Bob), federated monoliths or composable microservices combine the independence and agility of microservices with the integration and deployment simplicity of monoliths. This simple API framework supports CRUD operations for a domain model imported from a remote server with only a very basic contract. Following hexagonal architecture, the framework generates ports and dynamically wires them to local or federated adapters. Ports can be instrumented to handle errors and timeouts and piped together to form control flows.

See [federated-monolith-services](https://github.com/tysonrm/federated-monolith-services) for federated modules used by this project.
