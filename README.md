  [![aegis](https://user-images.githubusercontent.com/38910830/128654405-93098731-3c31-4f52-bda0-efe95d77c5fe.png)](https://blog.federated-microservices.com)


# ÆGIS <sub><sup>formerly _microlib_</sup></sub>

The ÆGIS federation host deploys, runs, integrates and persists federated application components (or federated microservice libraries) in a distributed middleware fabric. Multiple, polyglot services can run together on the same host instance while remaining independently deployable. This allows organizations to reduce their footprint and simplify their operations without loosing any of autonomy and loose coupling they've come to expect from the microservice architectural style. Conversely, services can just as easily be distributed across the ÆGIS fabric or service mesh, which can reach any part of the IT landscape: datacenter, edge, fronted, backend, mobile, embedded, IoT, phone or drone. In either case, the development experience is the same. Component deployment, integration and persistence is automated and transparent, freeing developers to concentrate on what pays the bills, the business logic. And paying the bills gets easier when you eliminated the need for bespoke deployment automation. Because federated deployment always works the same way, regardless of vendor or compute primitive, there's no vendor lock-in beacause there's virtually no deployment automation needed beyond federation.

This repo contains the host code. The library can be found [here](https://github.com/module-federation/aegis). An example of a federated app that runs on ÆGIS can be found [here](https://github.com/module-federation/aegis-app).

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/github.com/module-federation/aegis) 

Note: to avoid rate-limiting, create a variable in your Gitpod [profile](https://gitpod.io/account) called GITHUB_TOKEN with the value of a Github personal access [token](https://github.com/settings/apps). 

#### Open Branch:
[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/t/module-federation/aegis-app) 

# [Federated Microservices](https://trmidboe.medium.com/federated-applications-ba396d6925b1)

- loaded from multiple network locations and repositories at runtime;
- developed by multiple teams;
- run together in a single process;
- can be reloaded at any time without restarting the process or interrupting other components running in the process;
- are _not_ _installed_ on the server but _streamed_ over the network as needed.

![mono-micro-fed 001](https://user-images.githubusercontent.com/38910830/126571702-0cd570fd-2a94-4560-86b0-18d514d7cb65.jpeg)


## TL;DR

```shell
git clone https://github.com/module-federation/aegis-host
cd aegis-host
cp dotenv.example .env
yarn
yarn build
yarn start
yarn demo
```

Note: you no longer need to run the aegis-Example project, as the host has been configured to stream the federated
modules directly from GitHub.

[Importing your own app](#importing-your-own-repo)

## Purpose

Stop paying the "microservices premium."

When evaluating microservices as a candidate architecture, the most important fact to consider is that you are building a distributed application. Microservices are the components of distributed applications - and distribution is what enables their chief virtue, deployment independence. Unfortunately, relative to the traditional alternative, monoliths, distributed apps are much harder to build and manage. So much so, that many microservice implementations fail.

This trade-off, dealing with the increased scope, cost and risk that stems from distribution, is called paying the "microservices premium". Sometimes the premium is well worth it. But in many cases it does more harm than good, leading many experts to advise against starting with microservices, but to instead introduce them gradually as scope or demand increases.

That said, in cases where the implementation does succeed, organizations generally prefer microservices to monoliths because of the increased speed and agility that deployment independence brings. So one could make the argument that if the premium were somehow discounted, microservices would be appropriate for a much wider audience.

_**Consider, then, what would happen if we could eliminate the need for distribution and still allow for independent deployment.**_

Is there such an alternative? [Fowler](https://martinfowler.com/articles/microservices.html) describes the implicit premise behind the distribution/deployment trade-off:

> "One main reason for using services as components (rather than libraries) is that services are independently deployable. If you have an application that consists of multiple libraries in a single process, a change to any single component results in having to redeploy the entire application.”

While technologies that support hot deployment have been around for some time (such as [OSGi](https://www.osgi.org/)), it would appear, up until now anyway, perhaps due to complexity, labor intensity, or skills scarcity, they haven't been considered a viable option. Whatever the reason, with the advent of module federation, this view is no longer warranted.

Using module federation, it is possible to dynamically and efficiently import remote libraries, just as if they had been installed locally, with only a few, simple configuration steps. aegis exploits this technology to support a framework for building application components as independently deployable libraries, call them **microservice libraries**.

Using webpack dependency graphs, code splitting and code streaming, Aegis supports hot deployment of federated modules, as well as any dependencies not present on the host, allowing development teams to deploy whenever they choose, without disrupting other components, and without having to coordinate with other teams. To simplify integration, promote composability and ensure components remain decoupled, aegis implements the port-adapter paradigm from hexagonal architecture to standardize the way modules communicate, so intra- and interprocess communication is transparent. I.e., whether deployed locally to the same aegis host instance or remotely, its all the same to the module developer.

With Aegis, then, you get the best of both worlds. You are no longer forced to choose between manageability and autonomy. Rather, you avoid the microservices premium altogether by building truly modular and independently deployable component libraries that run together in the same process (or cluster of processes), in what you might call a _"polylith"_ - a monolith comprised of multiple (what would otherwise be) microservices.

---

## Features

One of the main goals of Aegis is to provide an alternative to distributed systems and the performance and operational challenges that come with them, while preserving the benefits of deployment independence. To this end, Aegis organizes components according to hexagonal architecture, such that the boundaries of, and relations between, federated components are clear and useful.

In addtion to zero-install, hot deployment and local eventing, aegis promotes strong boundaries between, and prevents coupling of, collocated components through the formalism of the port-adapter paradigm and the use of code generation to automate boilerplate integration tasks. Features include:

### Highlights

- Deployment independence without distribution
- Language independence without distribution
- Self-deployment (_no deployment automation required!_)
- Run on: any compute primitive: vm, container, raspberry pi...
- Run as: single process, cluster, or serverless function
- Containerless, secure, near-native performance using WebAssembly
- Zero downtime, zero storage, zero installation runtime (using code streaming)
- Transparent integration and persistence (same code works whether components are local or remote)
- Self-forming, high-speed, in-process service mesh (no side car)
- Runtime binding of services and adapters (add, modify features and fixes live in prod)
- Multithreading for CPU-bound workloads (e.g. AI inference)
- Distributed data / object fabric across datacenter, edge, mobile, IoT / embedded
- [Fractal, hexagonal architecture](https://trmidboe.medium.com/fractal-architecture-56a1d2d6a599) for high composability and strong component boundaries

### Detail
- [Dynamic API generation for federated modules](#zero-downtime---zero-install-deployment-api-generation)
- Dynamic, indvidualized storage adapter generation 
- Automatic persistence of federated modules
- Runtime port generation
- Runtime binding (port-adapter binding, adapter-service binding)
- Zero deployment automation required (install to any compute primitive)
- Self-forming Service Mesh
- Runtime linking of WebAssembly modules
- [Hot deployment of federated modules](#zero-downtime---zero-install-deployment-api-generation)
- Configuration-based service integration
- Configuration-based service orchestration
- Built-in error handling (circuit breaker, undo)
- Common broker for locally shared (in-memory) events
- Persistence API for cached datasources
- Datasource relations for federated schemas and objects
- Object broker for retrieving external model instances
- Dependency/control inversion (IoC)
- [Zero downtime, "zero install" deployment](#zero-downtime---zero-install-deployment-api-generation)
- Evergreen deployment and semantic versioning
- Dynamic A/B testing
- Exhaustive deployment options (run as a Server, Cluster or Severless Function)
- Vendor-agnostic serverless deployment (no vendor lock-in)
- Fast deployment - no-install deployment is the shortest path
- Self-deployment - built-in deployment automation
- Configurable serialization for network and storage I/O
- Clustering for availability and scalibilty
- Cluster cache synchronization
- Polyrepo code reuse (the answer to the shared code question)
- Automated CA certifcate setup and renewal with zero downtime
- Self-forming, built-in, pluggable service mesh
- Support for WebAssembly modules as models, adapters, services
- WebAssembly workflow - pipe modules togther to form control flows
- Polyglossia - write components in any lang with a Wasm compile target
- Eventually MLOps - ci/cd pipeline for machine learning deployment
- Sooner than later AIOps - deep learning for adaptive, lights-outs operations


---

<img width="148" alt="ports-adapters" src="https://user-images.githubusercontent.com/38910830/144235923-7a9159c8-9de0-480a-8b3f-dbcdd19a0012.png">

## Components

Aegis uses a modified     version of [Webpack Module Federation](https://webpack.js.org/concepts/module-federation/) to import remote modules over the network into the host framework at runtime. Aegis modules fall into three categories: `model`, `adapter` and `service`.

A [model](https://github.com/module-federation/aegis-application/blob/master/src/config/order.js) is a domain entity/service - or in [polylith](https://polylith.gitbook.io/) architecture, a component - that implements all or part of the service’s core logic. Each model has a corresponding ModelSpecification object which is used to define and configure core properties of the model and their values or bindings, such as URL endpoint of the service or external dependencies to be injected. The object implements an interface the has many options but only a few simple requirements, so developers can use as much, or as little, of the framework's capabilities as they choose.

One such capability is port generation. In a hexagonal or port-adapter architecture, ports handle I/O between the application and domain layers. An [adapter](https://github.com/module-federation/aegis-application/blob/master/src/adapters/event-adapter.js) implements the port ’s interface, facilitating communication with the outside world. As a property of models, ports are configurable and can be added, modified and deleted on the fly at runtime. Same goes for adapters. The framework automatically rebinds adapters to ports as needed, again with no downtime or restart required.

A [service](https://github.com/module-federation/aegis-application/blob/master/src/services/event-service.js) provides an optional layer of abstraction for adapters and usually implements a client library. When an adapter is written to satisfy a common integration pattern, a service implements a particular instance of that pattern. For example, an event adapter implements pub/sub functionality, which works with Kafka, Nats, or RabbitMQ. Simply bind the corresponding service to the outside-facing end of the adapter to enable the desired messaging provider. Like adapters to ports, the framework dynamically imports and binds services to adapters at runtime, which means, in our example, you change from Kakfa to Nats, or add Nats and use both, without ever taking the system offline.

---

<img width="124" alt="persistence" src="https://user-images.githubusercontent.com/38910830/144235261-2265f3be-0c84-4b0d-b395-b5c16ed3b7f3.png">

## Persistence

The framework automatically persists domain models as JSON documents either using the default adapter configured for the server or an adapter specifically configured for the model in the _ModelSpec_. In-memory, filesystem, and MongoDB adapters are provided. Adapters can be extended and individualized per model. Additionally, de/serialization can be customized. Finally, every write operation generates an event that can be forwarded to an external event or data sink.

A common datasource factory manages adapters and provides access to each service’s individual datasource. The factory supports federated schemas (think GraphQL) through relations defined between datasources in the _ModelSpec_. With local caching, not only are data federated, **but so are related domain models**.

```js
const customer = order.customer(); // relation `customer` defined in ModelSpec

const creditCard = customer.decrypt().creditCardNumber;
```

Access to data and objects requires explicit permission, otherwise services cannot access one another’s code or data. Queries execute against an in-memory copy of the data. Datasources leverage this cache by extending the in-memory adapter.

Note that the non-local cache or distributed cache is itself a storage option depending on the number of nodes in the service mesh and/or their attached storage. See the section on service mesh below.

### A note about external services and the Aegis fabric. 
When you deploy the same application model to multiple aegis instances, the application becomes a distributed application. If each application integrates with a different instance of a particular service, that service effectively becomes a single clustered instance. For example, deploying two Aegis instances that talk to two separate MongoDb instances, will cause the db instances to be synchronized.  

### Data fabric (distributed object cache) vs custom adapter
It's important to note that this automtatic persistence feature, while providing fairly sophisticated extensibility in and of itself, does not limit you from creating your own solution using ports and adapters, which more demanding use cases might call for; rather, it is merely an optional convenience that should prove effective in many common scenarios, saving you from boilerplate code. However, when writing a custom adapter, to be consistent with the design of the framework, local caching and object-relational APIs should be used to make your data available to the distributed cache (or data fabric), which supports performant, federated data access, as well as transparent integration.

---
<img width="124" alt="eventing" src="https://user-images.githubusercontent.com/38910830/144235314-608d49c3-858e-4582-81f7-0355e965ae5e.png">

## Integration

### Ports & Adapters

When ports are configured in the `ModelSpecification`, the framework dynamically generates methods on the domain model to invoke them. Each port is assigned an adapter, which either invokes the port (inbound) or is invoked by it (outbound).

Ports can be instrumented for exceptions and timeouts to extend the framework’s circuit breaker, retry and compensation logic. They can also be piped together in control flows by specifying the output event of one port as the input or triggering event of another.

An adapter either implements an external interface or exposes an interface for external clients to consume. On the port end, an adapter always implements the port interface; never the other way around. Ports are a function of the domain logic, which is orthogonal to environment-specific implementation details. By design, the domain has no knowledge of anything beyond the port. That which invokes an inbound port or that which is invoked by an outbound port - where the data comes from or where it goes - is irrelavent. Only the shape of the data (as defined by the domain interface) matters.

Ports optionally specify a callback to process data received on the port before control is returned to the caller. The callback is passed as an argument to the port function. Ports can be configured to run on receipt of an event, API request, or called directly from code.

Ports also have an undo callback for implementing compensating logic in the event of a downstream transaction failure. The framework remembers the order in which ports are invoked and runs the undo callback of each port in reverse order, starting at the point of failure. This allows transactions across multiple services to be rolled back.

### Local & Remote Events

In addition to in-memory function calls, federated objects and ports, services can communicate with one another locally the same way they do remotely: by publishing and subscribing to events. Using local events, microservice libraries are virtually as decoupled as they would be running remotely.

The framework provides a common broker for local service events and injects pub/sub functions into each model:

```js
modelA.listen(event, callback);

modelB.notify(event, data);
```

Local events can also be forwarded to remote event targets. Like any external integration remote ports must be configured for external event sources/sinks. Adapters are provided for **Kafka** and **WebSockets**.

---

<img width="148" alt="workflow" src="https://user-images.githubusercontent.com/38910830/144235360-5e9f009b-cb21-4350-bca4-9f0db5aadc26.png">

## Orchestration

Service orchestration is built on the framework’s port-adapter implementation. As mentioned, ports both produce and consume events, allowing them to be piped together in control flows by specifying the output event of one port as the input event of another. Because events are shared internally and can be forwarded externally, this implementation works equally well whether services are local or remote.

Callbacks specified for ports in the _ModelSpec_ can process data received on a port before its output event is fired and the next port runs. If not specified, the framework nevertheless saves the port output to the model. Of course, you can implement your own event handlers or adapter logic to customize the flow.

---

## Service Mesh

Aegis provides an in-process service mesh that ties Aegis instances together forming an data/object fabric, where data is federated, and workload can be distributed and deployed dynamically in response to functional or non-functional requirements and conditions. As opposed to a side car, the service mesh is built directly into the federation host and runs on the same port as the API, but uses the Websockets protocol. External clients can connect to the ws mesh interface to integrate with, observe or control any aegis component. The mesh enables federated data access and transparent integration of aegis components, such that component developers can write business logic that is valid regardless of where components are deployed. The service mesh itself is pluggable, allowing different implementations to be turned on and off (and to coexist in different parts of the mesh). The default implementation, "webswitch" is a self-forming, switched mesh based on websockets. A Nats and QUIC-based implementation are planned.

See <http://localhost/aegis.config.json>

```shell
public/aegis.config.json
```

## Running the Application

See above TL;DS section for a simplied install. Get up and running in about 60 seconds.

### Datasources

In the default configuaton, aegis uses the local filesystem for default persistence. Alternatively, you can install MongoDB and update the .env accordingly to change the default to Mongo. You can also update an individual model's datasource in the ModelSpec.

```shell
brew tap mongodb/brew
mongod
```

.env

```shell
DATASOURCE_ADAPTER=DataSourceMongoDb
MONGODB_URL=mongodb://localhost:27017
```

### Clustering

Aegis supports clustering with automatic cache synchronization and rolling restart for increased stability, scalality and efficiency with zero downtime. To enable:

.env

```
CLUSTER_ENABLED=true
```

### Serverless

Alternatively, Aegis can run as a serverless function. It's rated for AWS. Support can be extended to other platforms and vendors by writing a message parser that simply maps the input and output to request and response objects, indicating the HTTP method. See /adapters/serverless/parsers

### Authorization

ÆGIS supports JSON Web Tokens for authorization of protected routes. To enable, you must provide JSON Web Key URI to retrieve the public key of the signer of the JSON Web Token. You can set up an account with Auth0 for testing purposes. You update the key set configuration in the `public/aegis.config.json` file.

public/aegis.config.json

```json
{
  "cache": true,
  "rateLimit": true,
  "jwksRequestsPerMinute": 5,
  "jwksUri": "https://dev-2fe2iar6.us.auth0.com/.well-known/jwks.json",
  "audience": "https://aegis.io/",
  "issuer": "https://dev-2fe2iar6.us.auth0.com/",
  "algorithms": ["RS256"]
}
```

.env

```shell
AUTH_ENABLED=true
```

### Transport Layer Security (HTTPS)

When ÆGIS starts (in server mode), it will check for the presence of `certificate.pem` and `privatekey.pem` files in the cert folder. If not there, it will automatically provision an x509 certificate for your domain using the [ACME standard](https://datatracker.ietf.org/doc/html/rfc8555) and write the files to the `cert` directory. The following environment must be set. Note: if `NODE_ENV` is set to anything other than `prod` the systems will provision a test certificate.

.env

```shell
NODE_ENV=prod
DOMAIN=aegis.module-federation.org
SSL_ENABLED=true
```

### Importing your own repo

Two options are available: EASY BUTTON or DIY.

#### EASY BUTTON

Click [here](https://github.com/module-federation/aegis-app/generate) to generate the scaffolding for building a federated application with Aegis.

#### DIY

To import your own models, update the `webpack/remote-entries.js` to point to your remoteEntry.js file and change owner, repo, filedir, and branch accordingly, if using GitHub as a remote. You must specify these same attributes in your repo, only in webpack.config.js [publicPath as URL params](https://github.com/module-federation/aegis-Example/blob/master/webpack.config.js). Also from aegis-example, you'll need the same version of webpack and the [extensions in the webpack dir](https://github.com/module-federation/aegis-app/tree/master/webpack).

### Installation

[![install movie](https://img.youtube.com/vi/sHZgpIA_iWY/maxresdefault.jpg)](https://youtu.be/sHZgpIA_iWY)

### Zero Downtime - Zero Install Deployment, API Generation

[![hot deployment](https://img.youtube.com/vi/WqRlSnBxLYw/mqdefault.jpg)](https://youtu.be/WqRlSnBxLYw)

### Reference Architecture

[![ref arch](https://img.youtube.com/vi/6GJYX9cmk2Q/maxresdefault.jpg)](https://youtu.be/6GJYX9cmk2Q)

Aegis prevents vendor lock-in by providing a layer of abstraction on top of vendor serverless frameworks. A vendors API gateway simply proxies requests to the Aegis serverless function, which is the only function adapted to the vendor's platform. From that point on, Aegis handles the "deployment" of functions as federated modules. Developers don't even need to know what cloud is hosting their software!

## Further Reading

[Federated Microservices: Manageable Autonomy](https://trmidboe.medium.com/federated-applications-ba396d6925b1)

[Stop Paying the Microservice Premium: Eliminating the Microservices Deployment/Distribution Trade-Off](https://trmidboe.medium.com/discounting-the-microservice-premium-a95311c61367)

[Federated Applications: E Plurbis Unum](https://trmidboe.medium.com/federated-applications-e-plurbus-unum-2cc7850250a0?sk=08d98f5ae22695c2296fad382fb6006f)

[Self-Deploying Applications: Deployment Automation That Works Anywhere](https://trmidboe.medium.com/what-is-a-self-deploying-or-installation-free-application-658f4d79082d?sk=3e27745b6660fa2d6837545c8e075ad3)

[Cell-based Architecture and Federation](https://trmidboe.medium.com/cell-based-architecture-and-federated-microservices-4fc0cf3df5a6?sk=d50a09dcec880da26378f5e7522eb0b6)

[Clean Micoservices: Building Composable Microservices with Module Federation](https://trmidboe.medium.com/clean-microservices-building-composable-microservices-with-module-federation-f1d2b03d2b27)

[Webpack 5 Module Federation: A game-changer in JavaScript architecture](https://medium.com/swlh/webpack-5-module-federation-a-game-changer-to-javascript-architecture-bcdd30e02669)

[Microservice trade-offs](https://martinfowler.com/articles/microservice-trade-offs.html)

[Microservice Library Videos](https://www.youtube.com/channel/UCT-3YJ2Ilgcjebqvs40Qz2A)

<img src="https://ssl.google-analytics.com/collect?v=1&t=event&ec=email&ea=open&t=event&tid=UA-120967034-1&z=1589682154&cid=ae045149-9d17-0367-bbb0-11c41d92b411&dt=aegis&dp=/email/aegis">
