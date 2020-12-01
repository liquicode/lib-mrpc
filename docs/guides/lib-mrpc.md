
# Abount lib-mrpc


## Overview

A transport agnostic message based remote procedure call library designed to facilitate the
evolution and scalability of complex systems.

What this library offers is a base `ServiceProvider` class and a number of specific `ServiceProvider`
implementations where each implementation utilizes a different transport mechanism to provide the
library's remote procedure call functionality.
Examples of different transport mechanisms include http gets and posts, message queues, pub/sub channels, etc.

Each `ServiceProvider` allows you to define a number of named `Endpoints` that can be invoked by client code.
Each endpoint has function associated with it and is called whenever the `Endpoint` is invoked.
The function is passed a set of parameters and its return values and errors are to delivered back
to the client calling code.
The mechanics of packaging and unpackaging parameters, return values, and errors are handled by each
`ServiceProvider` implementation.

Almost every application of moderate complexity has to operate in and support more than one environment.
Usually this is the development environment and the production environment.
An application has to account for the differences between the two environments in a consistent manner.
Often there will also be other environments that an application will need to contend with.
Popular development strategies usually include environments used for testing, staging, limited releases, etc.
The goal of this library is to easily allow applications to function consistently and gracefully across many
different deployment environments.

By abstracting the transport layer of remote procedure calls, an application gains a great deal
of flexibility with regards to the way it can be developed and deployed.
An application or system can start out small with a set of well defined functional units.
While the system is small, it can be easily developed and debugged within a single development session.
As the complexity of a system increases, development challenges arise when parts of a system
need to be isolated and scaled.
In a moderately complex system, it is not unreasonable to have code running across half a dozen
or more different development projects and code bases.
In these cases, development efficiency is reduced as additional effort is required to execute and debug
across several different development/debug sessions and coordinating the interaction between them.

Using `lib-mrpc`, you can initially develop and debug system functionality quickly with the
`ImmediateServiceProvider` which presents all of its `Endpoints` as in-process callable code
and lends itself to a streamlined and synchronous development and debugging workflow.
As parts of the system mature, service `Endpoints` can be migrated to other `ServiceProviders`
which allow multi-threaded and remote processing.
Selecting which `ServiceProvider` will host a set of `Endpoints` can be done without altering the
calling code in any meaningful way and con be as simple as a change in configuration.

By having control over where your code runs, it becomes possible to easily configure
and construct a development environment where everything runs locally within the same
process. This same code can also become a distributed system when deployed into production.


## Service Providers

`lib-mrpc` offers a number of different `ServiceProvider` implementations.
Implementations can store and execute `Endpoints` in many different ways.
There are three categories of service provider which group implementations according to how and
where `Endpoints` are executed:

- Native Service Providers: `Endpoints` execute within the same process as the calling code.
	The "server" code and the "client" code always share the same instance.
- Local Service Providers: `Endpoints` execute on the same machine as the calling code.
	The "server" code and the "client" code may share the same instance.
- Remote Service Providers: `Endpoints` execute on a different machine as the calling code.
	The "server" code and the "client" code may share the same instance.


### Native Service Provders

Native service providers store `Endpoints` within the same process as the calling code.
When an endpoint is called, it will run within the same process.

- `ImmediateServiceProvider`:
	Service `Endpoints` are called synchronously and executed immediately.

- `DeferredServiceProvider`:
	Service `Endpoints` are called asynchronously and their execution is queued until the end of
	Node's main processing loop.
	While this provider offers asynchronous execution, all processing is still done within Node's
	main processing loop and does not present a multi-threaded solution.

- `WorkerThreadServiceProvider`: Service `Endpoints` are called asynchronously and their execution
	is performed on a worker thread.
	This provider does present a full asynchronous and multi-threaded solution.


### Local Service Provders

Local service providers may store `Endpoints` within a different process as the calling code,
but transport messages (requests and replies) using local system (os) resources.

- `FSWatchServiceProvider`: Uses Node's `fs` library to communicate via a shared file system folder.


### Remote Service Provders

Remote service providers may store code on a different machine from the calling code.
In many instances, these service providers require the inclusion of third-party libraries to implement the
underlying transport mechanism.


***Web Sockets***


***Message Queues***

- `AmqpLibServiceProvider`:
	Service `Endpoints` are invoked remotely via a message queue supporting the [amqp](https://www.amqp.org/) v0.9.1 protocol.
	Requires the [amqplib/amqp.node](https://github.com/squaremo/amqp.node) third-party library.
	Tested with [RabbitMQ](https://www.rabbitmq.com/).

- `TortoiseServiceProvider` : 
	Service `Endpoints` are invoked remotely via a message broker supporting the [amqp](https://www.amqp.org/) v0.9.1 protocol.
	Requires the [tortoise](https://github.com/CompassPHS/tortoise) third-party library.
	Tested with [RabbitMQ](https://www.rabbitmq.com/).


***General Pub/Sub***

- `RedisServiceProvider` : (***Document Here***)


## ServiceClient

- A client to manage and invoke remote services.
- Can implement dependency injection and configuration at load time.
- object `Services` : Stores connections to remote services.
- function `ConnectService( Service )`
	- Register a service that will be available.
	- object `Service` : A service object to connect to.
- function `DisconnectService( ServiceName )`
	- Deregister an available service.
	- string `ServiceName` : The name of the service to disconnect.
- async function `CallEndpoint( ServiceName, EndpointName, CommandParameters, CommandCallback )`
	- Invoke an endpoint available in this service.
	- string `ServiceName` : The name of the service containing the endpoint.
	- string `EndpointName` : The name of the endpoint within the service.
	- object `CommandParameters` : The parameters to pass to the endpoint function.
	- function `CommandCallback` : The callback function used to report endpoint results.


