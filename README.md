![MicroLib](https://github.com/tysonrm/MicroLib/blob/master/wiki/microlib.png)
# MicroLib

## Purpose
Get rid of the bad, keep the good. Like any architecture, microservice-style architectures impose a number of tradeoffs. Chief among them is deployment independence versus operational complexity. Building the components of an application as a set of separate, networked executables provides the freedom to deploy at your own pace, but managing a distributed application is inherently more difficult than running a monolith. 

The implicit premise behind this tradeoff is expressed by [Fowler](https://martinfowler.com/articles/microservices.html): 

> "One main reason for using services as components (rather than libraries) is that services are independently deployable. If you have an application that consists of multiple libraries in a single process, a change to any single component results in having to redeploy the entire application.”

While, in fact, there are, and have been, technologies to deploy libraries without redeploying the application (consider [OSGi](https://www.osgi.org/)), it seems their complexity and the level of effort required to use them outweighed any potential benefit. At least until now...

With the introduction of module federation, it is possible to dynamically import remote libraries, just as if you were importing them locally, with only a few simple configuration steps. MicroLib exploits this technology to support a framework for building application components as independently deployable libraries running in the same process, or what might be loosely called, **microservice libraries**.

***

## Features 
The main benefit of collocated services is clear. MicroLib goes further in organizing components according to hexagonal architecture, such that the boundaries and relations between federated components is clear and useful. Features include:

* Dynamic API generation for imported modules
* Dynamic, independent persistence of imported modules
* Dynamic port generation for imported modules
* Dynamic port-adapter binding
* Dynamic adapter-service binding
* Configuration-based service integration
* Configuration-based service orchestration
* Common broker for local, shared events
* Persistence API for cached datasources
* Datasource relations for federated schemas
* Dependency/control inversion (IoC)
* Zero downtime, "zero install" deployment
* Evergreen deployment and semantic versioning
* Dynamic A/B testing
* Serverless deployment
* Configurable serialization for network and storage I/O
* Code reuse that works with multiple repos

***

![Components](https://github.com/tysonrm/MicroLib/blob/master/wiki/port-adapter.png)
## Components

MicroLib uses [Webpack Module Federation](https://webpack.js.org/concepts/module-federation/#building-blocks) to import remote modules into the host framework at runtime. 
MicroLib modules fall into three categories: **_model_**, **_adapter_** and **_service_**.

A **_model_** is a domain entity/service that implements all or part of the service’s core logic. It also implements the MicroLib **_ModelSpecification_** interface. The interface has few requirements, but many options. The more options a model implements, the more framework capabilities it takes advantage of. 

One such capability is port generation. In a hexagonal or port-adapter architecture, ports handle I/O between the application and domain layers. An **_adapter_** implements the port ’s interface, facilitating communication with the outside world. The framework dynamically imports and binds adapters to ports at runtime.

A **_service_** provides an optional layer of abstraction for adapters and usually implements a client library. Services allow adapters to be generalized for common integration patterns, where a service represents a particular implementation of a pattern. Like ports to adapters, the framework dynamically imports and binds services to adapters at runtime.

***

![Persistence](https://github.com/tysonrm/MicroLib/blob/master/wiki/persistence.png)
## Persistence
The framework automatically persists domain models as JSON documents using the default adapter configured for the server instance. In-memory, filesystem, and MongoDB adapters are provided. Adapters can be extended and individualized per model. Additionally, de/serialization can be customized. Finally, every write operation generates an event that can be forwarded to an external event or data source.

A common datasource factory manages adapters and provides access to each service’s individual datasource. The factory supports federated schemas, think GraphQL, through relations defined between datasources in the _ModelSpec_. Apart from this, services cannot access one another’s data. Queries execute against an in-memory copy of the data. Datasources leverage this cache by extending the in-memory adapter. 

***

![Eventing](https://github.com/tysonrm/MicroLib/blob/master/wiki/eventing.png)
## Integration

### Ports & Adapters
When ports are configured in the _ModelSpecification_, the framework dynamically generates methods on the domain model to invoke them. Each port is assigned an adapter, which either invokes the port (inbound) or is invoked by it (outbound). 

Ports can be instrumented for exceptions and timeouts to extend the framework’s retry and compensation logic.
They can also be piped together in control flows by specifying the output event of one port as the input or triggering event of another.

An adapter either implements an external interface or exposes an interface for external clients to consume.
On the port side, an adapter always implements the port interface; never the other way around. Ports are a function of the domain logic, which should remain static in the face of environmental changes.

Ports optionally specify a callback to process data received on the port before control is returned to the caller. The callback is passed as an argument to the port function. Ports can be configured to run on receipt of an event, API request, or called directly from code.

Ports also have an undo callback for implementing compensating logic. The framework remembers the order in which ports are invoked and runs the undo callback of each port in reverse order, starting at the point of failure. This allows transactions across multiple services to be rolled back.

### Local & Remote Events

In addition to in-memory function calls, services can communicate locally the same way they do remotely: by publishing and subscribing to events. Using locally shared events, microservice libraries are virtually as decoupled as they would be running remotely.

The framework provides a common broker for inter-service events and injects pub/sub functions into each model:

`ModelA.listen(event, callback)`

`ModelB.notify(event, data)`

Like any external integration, ports must be configured to integrate with remote event sources/sinks. Adapters are provided for **Kafka** and **WebSockets**.

***

![Workflow](https://github.com/tysonrm/MicroLib/blob/master/wiki/workflow.png)
## Workflow

Service orchestration is built on the framework’s port-adapter implementation. As mentioned, ports both produce and consume events, allowing them to be piped together in control flows by specifying the output event of one port as the input event of another. Because events are shared internally and can be forwarded externally, this implementation works equally well whether services are local or remote.

Callbacks specified for ports in the _ModelSpec_ can process data received on a port before its output event is fired and the next port runs. If not specified, the framework nevertheless saves the port output to the model. Of course, you can implement your own event handlers or adapter logic to customize the flow.

## Futher Reading

[Clean Micoservices: Building Composable Microservices with Module Federation](https://trmidboe.medium.com/clean-microservices-building-composable-microservices-with-module-federation-f1d2b03d2b27)

