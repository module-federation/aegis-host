![MicroLib](https://github.com/tysonrm/MicroLib/blob/master/wiki/microlib.png)

# MicroLib <sub><sup>codename _Aegis_</sup></sub>

Microservice Libraries

## Purpose

Stop paying the "microservices premium".

When evaluating microservices as a candidate architecture, the most important fact to consider is that you are building a distributed application. Microservices are the components of distributed applications - and distribution is what enables their chief virtue, deployment independence. Unfortunately, relative to the traditional alternative, monoliths, distributed apps are much harder to build and manage. So much so, that many microservice implementations fail.

This trade-off, dealing with the increased scope, cost and risk that stems from distribution, is called paying the "microservices premium". Sometimes the premium is well worth it. But in many cases it does more harm than good, leading many experts to advise against starting with microservices, but to instead introduce them gradually as scope or demand increases.

That said, in cases where the implementation does succeed, organizations generally prefer microservices to monoliths because of the increased speed and agility that deployment independence brings. So one could make the argument that if the premium were somehow discounted, microservices would be appropriate for a much wider audience.

_**Consider, then, what would happen if we could eliminate the need for distribution and still allow for independent deployment.**_

Is there such an alternative? [Fowler](https://martinfowler.com/articles/microservices.html) describes the implicit premise behind the distribution/deployment trade-off:

> "One main reason for using services as components (rather than libraries) is that services are independently deployable. If you have an application that consists of multiple libraries in a single process, a change to any single component results in having to redeploy the entire application.”

While technologies that support hot deployment have been around for some time (such as [OSGi](https://www.osgi.org/)), it would appear, up until now anyway, perhaps due to complexity, labor intensity, or skills scarcity, they haven't been considered a viable option. Whatever the reason, with the advent of module federation, this is no longer the case.

Using module federation, it is possible to dynamically and efficiently import remote libraries, just as if they had been installed locally, with only a few, simple configuration steps. MicroLib exploits this technology to support a framework for building application components as independently deployable libraries, call them **microservice libraries**.

Using webpack dependency graphs, code splitting and code streaming, MicroLib supports hot deployment of federated modules, as well as any dependencies not present on the host, allowing development teams to deploy whenever they choose, without disrupting other components, and without having to coordinate with other teams. To simplify integration and ensure components remain decoupled, MicroLib implements the port-adapter paradigm from hexagonal architecture to standardize the way modules communicate. Whether deployed locally to the same MicroLib host instance or remotely, its all the same to the module developer.

With MicroLib, then, you get the best of both worlds. You are no longer forced to choose between manageability and autonomy. Rather, you avoid the microservices premium altogether by building truly modular and independently deployable component libraries that run together in the same process (or cluster of processes), in what you might call a _"polylith"_ - a monolith comprised of multiple (what would otherwise be) microservices.

---

## Features

The goal of MicroLib is to provide an alternative to distributed systems and the performance and operational challenges that come with them, while preserving the benefits of deployment independence. To this end, MicroLib organizes components according to hexagonal architecture, such that the boundaries of, and relations between, federated components are clear and useful.

In addtion to zero-install, hot deployment and local eventing, MicroLib promotes strong boundaries between, and prevents coupling of, collocated components through the formalism of the port-adapter paradigm and the use of code generation to automate boilerplate integration tasks. Features include:

- [Dynamic API generation for federated modules](#zero-downtime---zero-install-deployment-api-generation)
- Dynamic, independent persistence of federated modules
- Dynamic port generation for federated modules
- Dynamic port-adapter binding
- Dynamic adapter-service binding
- [Hot reload of federated modules](#zero-downtime---zero-install-deployment-api-generation)
- Configuration-based service integration
- Configuration-based service orchestration
- Common broker for locally shared events
- Persistence API for cached datasources
- Datasource relations for federated schemas and objects
- Object broker for retrieving external model instances
- Dependency/control inversion (IoC)
- [Zero downtime, "zero install" deployment](#zero-downtime---zero-install-deployment-api-generation)
- Evergreen deployment and semantic versioning
- Dynamic A/B testing
- Serverless "deployless" fast spinup
- Configurable serialization for network and storage I/O
- Clustering for availability and scalibilty
- Cluster cache synchronization
- Polyrepo code reuse (the answer to the shared code question)

---

![Components](https://github.com/tysonrm/MicroLib/blob/master/wiki/port-adapter.png)

## Components

MicroLib uses a modified version of [Webpack Module Federation](https://webpack.js.org/concepts/module-federation/) to import remote modules over the network into the host framework at runtime. MicroLib modules fall into three categories: `model`, `adapter` and `service`.

A `model` is a domain entity/service - or in [polylith](https://polylith.gitbook.io/) architecture, a component - that implements all or part of the service’s core logic. It also implements the MicroLib [ModelSpecification](https://github.com/module-federation/MicroLib-Example/blob/master/src/config/order.js) interface. The interface has many options but only a few simple requirements, so developers can use as much, or as little, of the framework's capabilities as they choose.

One such capability is port generation. In a hexagonal or port-adapter architecture, ports handle I/O between the application and domain layers. An [adapter](https://github.com/module-federation/MicroLib-Example/blob/master/src/adapters/event-adapter.js) implements the port ’s interface, facilitating communication with the outside world. As a property of models, ports are configurable and can be hot-added, -replaced or -removed, in which case the framework automatically rebinds their adapters as needed. Adapters by themselves can also be hot-replaced and rebound.

A [service](https://github.com/module-federation/MicroLib-Example/blob/master/src/services/event-service.js) provides an optional layer of abstraction for adapters and usually implements a client library. When an adapter is written to satisfy a common integration pattern, a service implements a particular instance of that pattern, binding to the outside-facing end of the adapter. Like adapters to ports, the framework dynamically imports and binds services to adapters at runtime.

---

![Persistence](https://github.com/tysonrm/MicroLib/blob/master/wiki/persistence.png)

## Persistence

The framework automatically persists domain models as JSON documents using the default adapter configured for the server. In-memory, filesystem, and MongoDB adapters are provided. Adapters can be extended and individualized per model. Additionally, de/serialization can be customized. Finally, every write operation generates an event that can be forwarded to an external event or data source.

A common datasource factory manages adapters and provides access to each service’s individual datasource. The factory supports federated schemas (think GraphQL) through relations defined between datasources in the _ModelSpec_. With local caching, not only are data federated, **but so are related domain models**. 
```js
const customer = order.customer(); // relation `customer` defined in ModelSpec

const creditCard = customer.decrypt().creditCardNumber;
```
Access to data and objects requires explicit permission, otherwise services cannot access one another’s code or data. Queries execute against an in-memory copy of the data. Datasources leverage this cache by extending the in-memory adapter.

---

![Eventing](https://github.com/tysonrm/MicroLib/blob/master/wiki/eventing.png)

## Integration

### Ports & Adapters

When ports are configured in the `ModelSpecification`, the framework dynamically generates methods on the domain model to invoke them. Each port is assigned an adapter, which either invokes the port (inbound) or is invoked by it (outbound).

Ports can be instrumented for exceptions and timeouts to extend the framework’s retry and compensation logic. They can also be piped together in control flows by specifying the output event of one port as the input or triggering event of another.

An adapter either implements an external interface or exposes an interface for external clients to consume. On the port end, an adapter always implements the port interface; never the other way around. Ports are a function of the domain logic, which is orthogonal to environmental concerns.

Ports optionally specify a callback to process data received on the port before control is returned to the caller. The callback is passed as an argument to the port function. Ports can be configured to run on receipt of an event, API request, or called directly from code.

Ports also have an undo callback for implementing compensating logic. The framework remembers the order in which ports are invoked and runs the undo callback of each port in reverse order, starting at the point of failure. This allows transactions across multiple services to be rolled back.

### Local & Remote Events

In addition to in-memory function calls, federated objects and ports, services can communicate with one another locally the same way they do remotely: by publishing and subscribing to events. Using local events, microservice libraries are virtually as decoupled as they would be running remotely.

The framework provides a common broker for local service events and injects pub/sub functions into each model:

```js
ModelA.listen(event, callback);

ModelB.notify(event, data);
```

Local events can also be forwarded to remote event targets. Like any external integration remote ports must be configured for external event sources/sinks. Adapters are provided for **Kafka** and **WebSockets**.

---

![Workflow](https://github.com/tysonrm/MicroLib/blob/master/wiki/workflow.png)

## Orchestration

Service orchestration is built on the framework’s port-adapter implementation. As mentioned, ports both produce and consume events, allowing them to be piped together in control flows by specifying the output event of one port as the input event of another. Because events are shared internally and can be forwarded externally, this implementation works equally well whether services are local or remote.

Callbacks specified for ports in the _ModelSpec_ can process data received on a port before its output event is fired and the next port runs. If not specified, the framework nevertheless saves the port output to the model. Of course, you can implement your own event handlers or adapter logic to customize the flow.

---

## Running the Application

To demonstrate that polyrepo code sharing is a reality, you will clone two repos. The first is MicroLib-Example, which shows you how you might implement an Order service using MicroLib. It also mocks several services and how they might communicate over an event backbone (Kafka). In module-federation terms, this is the remote. The second is the MicroLib host, which streams federated modules exposed by the remote over the network and generates CRUD REST API endpoints for each one.

```shell
git clone https://github.com/module-federation/MicroLib-Example.git
cd *Example
npm ci
echo "KAFKA_GROUP_ID=remote" > .env
echo "ENCRYPTION_PWD=secret" >> .env
npm run build

```

```shell
git clone https://github.com/module-federation/MicroLib.git
cd MicroLib
npm ci
echo "KAFKA_GROUP_ID=host" > .env
echo "ENCRYPTION_PWD=secret" >> .env
echo "DATASOURCE_ADAPTER=DataSourceFile" >> .env
npm run build
```

Start the services:

```shell
# in MicroLib-Example dir
npm run start-all
# in MicroLib dir
npm start
```

### Datasource

In the above configuaton, Microlib uses the local filesystem for default persistence. Alternatively, you can install MongoDB and update the .env accordingly to change to database default persistence. You can also update an individual model's datasource in the ModelSpec.

```shell
brew install mongodb-community
mongod
```

.env

```shell
DATASOURCE_ADAPTER=DataSourceMongoDb
MONGODB_URL=mongodb://localhost:27017
```

### Clustering

MicroLib supports clustering with automatic cache synchronization and rolling restart for increased stability, scalality and efficiency with zero downtime. When you rebuild the example service, it will automatically update the cluster. To enable:

.env

```
CLUSTER_ENABLED=true
```

### Authorization

MicroLib supports JSON Web Tokens for authorization of protected routes. To enable, you must provide JSON Web Key URI to retrieve the public key of the signer of the JSON Web Token. You can set up an account with Auth0 for testing purposes. You update the key set configuration in the `auth` directory.

auth/key-set.json

```json
{
  "cache": true,
  "rateLimit": true,
  "jwksRequestsPerMinute": 5,
  "jwksUri": "https://dev-2fe2iar6.us.auth0.com/.well-known/jwks.json",
  "audience": "https://microlib.io/",
  "issuer": "https://dev-2fe2iar6.us.auth0.com/",
  "algorithms": ["RS256"]
}
```

.env

```shell
AUTH_ENABLED=true
```

HTTPS

To enable Transport Layer Security, you'll need to import and trust the certificate in the `cert` directory or provide your own cert and private key. Then update .env.

cert

```shell
-rw-r--r--  1 tysonrm  staff  1090 Mar 19 06:55 csr.pem
-rw-r--r--  1 tysonrm  staff  1314 Mar 19 06:30 domain.crt
-rw-r--r--  1 tysonrm  staff  1679 Mar 19 06:54 server.key
```

.env

```shell
SSL_ENABLED=true
```

### Installation

![install](https://github.com/module-federation/MicroLib/blob/master/wiki/microlib-install-4k.gif)

### Zero Downtime - Zero Install Deployment, API Generation

![hotreload](https://github.com/module-federation/MicroLib/blob/master/wiki/hot-reload.gif)

---

## Further Reading

[Clean Micoservices: Building Composable Microservices with Module Federation](https://trmidboe.medium.com/clean-microservices-building-composable-microservices-with-module-federation-f1d2b03d2b27)

[Webpack 5 Module Federation: A game-changer in JavaScript architecture](https://medium.com/swlh/webpack-5-module-federation-a-game-changer-to-javascript-architecture-bcdd30e02669)

[Microservice trade-offs](https://martinfowler.com/articles/microservice-trade-offs.html)

<img src="https://ssl.google-analytics.com/collect?v=1&t=event&ec=email&ea=open&t=event&tid=UA-120967034-1&z=1589682154&cid=ae045149-9d17-0367-bbb0-11c41d92b411&dt=MicroLIb&dp=/email/MicroLib">
