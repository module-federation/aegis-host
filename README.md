![MicroLib](https://github.com/tysonrm/MicroLib/blob/master/wiki/microlib.png)
# MicroLib

## Purpose
Get rid of the bad, keep the good. Like any architecture, Microservice-style architectures impose several tradeoffs. Chief among them is deployment independence versus operational complexity. Building the components of an application as a set of separate, networked executables provides the freedom to deploy at your own pace, but managing a distributed application is inherently more difficult than running a monolith. 

The implicit premise behind this tradeoff is expressed by [Fowler](https://martinfowler.com/articles/microservices.html): 

> "One main reason for using services as components (rather than libraries) is that services are independently deployable. If you have an application that consists of multiple libraries in a single process, a change to any single component results in having to redeploy the entire application.”

While there are and have been, in fact, ways to deploy libraries without redeploying the application (consider OSGi), it seems the difficultly in working with them has outweighed their potential benefit. 

If that was ever the case, it is no longer. With the introduction of module federation, it is possible to dynamically import remote libraries, just as if you were importing them locally, with only a few simple configuration steps. MicroLib exploits this technology to support a framework for building application components as independently deployable libraries running in the same process, or what might be loosely called "**microservice libraries**."

***

## Features 
The main benefit of "collocated microservices" is clear. MicroLib goes further in organizing components according to hexagonal architecture, such that the boundaries and relations between federated components is clear and useful. Features include:

* Dynamic API generation for imported modules
* Dynamic, independent persistence of imported modules
* Dynamic port generation for imported modules
* Dynamic port-adapter binding
* Configuration-based service integration
* Configuration-based service orchestration
* Common broker for internal, shared events
* Persistence API for cached datasources
* Datasource relations for federated schemas
* Dependency/control inversion (IoC)
* Zero downtime, "zero install" deployment
* Evergreen deployment and semantic versioning
* Dynamic A/B testing deployment
* Serverless deployment
* Code reuse that works with multiple repos
* Configurable serialization for network and storage I/O

***

![Components](https://github.com/tysonrm/MicroLib/blob/master/wiki/port-adapter.png)
## Components


***

![Persistence](https://github.com/tysonrm/MicroLib/blob/master/wiki/persistence.png)
## Persistence


***

![Eventing](https://github.com/tysonrm/MicroLib/blob/master/wiki/eventing.png)
## Integration


***

![Workflow](https://github.com/tysonrm/MicroLib/blob/master/wiki/workflow.png)
## Workflow




# Composable Microservices

Cf. [Clean Micoservices: Building Composable Microservices with Module Federation](https://trmidboe.medium.com/clean-microservices-building-composable-microservices-with-module-federation-f1d2b03d2b27)

Using module federation (a la [Zack Jackson](https://github.com/ScriptedAlchemy)) and clean architecture (a la Uncle Bob), composable microservices combine the independence and agility of microservices with the integration and deployment simplicity of monoliths. This simple API framework supports CRUD operations for domain models whose source code, and that of any dependencies, is streamed over HTTP from a remote server at runtime. Following hexagonal architecture, the framework can be configured to generate ports and bind them dynamically to local or federated adapters. Similarly, adapters can be wired to remotely imported services at runtime. Ports can be piped together to form control flows by configuring the output event of one port as the input or triggering event of another. The history of port invocations is recorded so compensating flows are generated automatically.

The sample code in [composable-microservices-remotes](https://github.com/tysonrm/federated-monolith-services) shows a domain object, Order, whose ports are bound to a payment, inventory, and shipping service. The ports are configured to participate in a control flow that implements the saga orchestrator pattern to manage an order process from beginning to end.
