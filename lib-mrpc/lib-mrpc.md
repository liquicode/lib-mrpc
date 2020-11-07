
# lib-mrpc

A transport agnostic message based remote procedure call library designed to facilitate the
evolution and scalability of complex systems.

This library allows you to define a number of specific commands (`Endpoints`) that can be
invoked, regardless of location, using a transport abstraction (`ServiceProvider`).

By abstracting the transport layer of the RPC, an application gains a great deal
of flexibility with regards to the way it can be developed and deployed.
An application or system can start out small with well defined functional units.
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


# Service Providers

`lib-mrpc` offers a number of different `ServiceProvider` implementations.
Implementations can store and execute `Endpoints` in many different ways.
There are three categories of service provider which group implementations according to how and
where `Endpoints` are executed:
- Native Service Providers: `Endpoints` execute within the same process as the calling code.
- Local Service Providers: `Endpoints` execute on the same machine as the calling code.
- Remote Service Providers: `Endpoints` execute on a different machine as the calling code.


## Native Service Provders

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


## Local Service Provders

Local service providers may store `Endpoints` within a different process as the calling code,
but transport messages (requests and replies) using local system resources.

- `FileSystemServiceProvider`: 


## Remote Service Provders

Remote service providers may store code on a different machine from the calling code.
In many instances, these service providers require the inclusion of third-party libraries to implement the
underlying transport mechanism.

- `AmqpLibServiceProvider`:
	Service `Endpoints` are invoked remotely via a message queue supporting the [amqp](https://www.amqp.org/) v0.9.1 protocol.
	Requires the [amqplib/amqp.node](https://github.com/squaremo/amqp.node) third-party library.
	Tested with [RabbitMQ](https://www.rabbitmq.com/).


# Endpoints

An `Endpoint` represents a function that does specific work for an application.


---------------------------------------------------------------------

# ***Deprecated Documentation:***

## Channels and Channel Providers

A `Channel` is an abstraction of the transport layer in a remote procedure call.
A `ChannelProvider` is responsible for implementing the `Channel` that is used for this communication.
It transports function parameters and return values between the caller and the function implementation.


### Types of Channel Providers

- `MemoryChannel`: Allows direct access to `Endpoints`.
	Useful for prototyping and debugging.
- `ThreadChannel`: `Endpoints` are run on seperate threads.
	This transport allows you to deploy a truly multi-threaded Node.js application.
- `ProcessChannel`: `Endpoints` are run in child processes.
	For when a task needs its own entire Node.js process.
	This may be needed if your `Endpoint` depends on external libraries.
- `FileChannel`: `Endpoints` run in different Node.js instances and communicate via the file system.
	This is useful for communication between different applications.
- `HttpChannel`: Each `Endpoint` is exposed as an http web-service endpoint.
	Traditional client-server applications will often use this type of transport.
- `WebSocketChannel`: Each `Endpoint` is exposed as a web-socket endpoint.
	An alternative to the http web-socket `Endpoint`.
- `StompChannel`: `Endpoints` are accessible via a message queue.
	`Endpoints` can be run anwhere that is accessible to any message queue system that uses the STOMP protocol.
	Such as ActiveMQ, RabbitMQ, etc.
- `SmtpChannel`: 
- `AwsLambdaChannel`: (?) An `Endpoint` is implemented as an AWS Lambda function.
	The `ChannelProvider` is responsible for creating and destroying the AWS Lamda.


## API

- ChannelProvider.NewEndpoint( EndpointName, CommandFunction )
	// EndpointName <string>: Unique name of this endpoint.
	// CommandFunction <function>: Function to be executed at this endpoint.

- ChannelProvider.DestroyEndpoint( EndpointName )

- Promise = CallEndpoint( EndpointName, CommandParameters )
	// EndpointName <string>: Name of the endpoint to call.
	// CommandParameters <object>: Parameters for the CommandFunction at this endpoint.
	// Promise <Promise>: Returns a promise that resolves to the return value of the CommandFunction.


---------------------------------------------------------------------


### `ServiceClient`

- A client to manage and invoke remote services.
- object `Services` : Stores connections to remote services.
- function `ConnectService( Service )`
	- Register a service that will be available.
	- object `Service` : A service object to connect to.
- function `DisconnectService( ServiceName )`
	- Deregister an available service.
	- string `ServiceName` : The name of the service to disconnect.
- function `CallEndpoint( ServiceName, EndpointName, CommandParameters, ReplyCallback )`
	- Invoke an endpoint available in this service.
	- string `ServiceName` : The name of the service containing the endpoint.
	- string `EndpointName` : The name of the endpoint within the service.
	- object `CommandParameters` : The parameters to pass to the endpoint function.
	- function `ReplyCallback` : The callback function used to report endpoint results.

### `ServiceProvider`

- A transport-specific provider.
- string `ServiceName` : The unique name of this service.
- object `Endpoints` : A map of named endpoints available via this service.
- async function `OpenPort()`
	- Perform any work needed to start accepting requests for endpoints.
- async function `ClosePort()`
	- Stop listening for requests and free up related resources.
- async function `AddEndpoint( EndpointName, CommandFunction )`
	- Add a callable endpoint to the service.
	- string `EndpointName` : The name of the endpoint within this service.
	- async function `CommandFunction` : 
- async function `DestroyEndpoint( EndpointName )`
	- Remove an endpoint from the service.
	- string `EndpointName` : The name of the endpoint within this service.
- async function `CallEndpoint( EndpointName, CommandParameters, ReplyCallback )`
	- Invoked by a client to execute an endpoint in this service.
	- string `EndpointName` : The name of the endpoint within this service.
	- object `CommandParameters` : The parameters to pass to the endpoint function.
	- [async] function `ReplyCallback` : The callback function used to report endpoint results.



## Resources

- [Yield! Yield! How Generators work in JavaScript.](https://www.freecodecamp.org/news/yield-yield-how-generators-work-in-javascript-3086742684fc/)
- [Trying to understand generators / yield in node.js - what executes the asynchronous function?](https://stackoverflow.com/questions/17516952/trying-to-understand-generators-yield-in-node-js-what-executes-the-asynchron)
- [A Study on Solving Callbacks with JavaScript Generators](https://jlongster.com/A-Study-on-Solving-Callbacks-with-JavaScript-Generators)
- [A Closer Look at Generators Without Promises](https://jlongster.com/A-Closer-Look-at-Generators-Without-Promises)
- [Taming the Asynchronous Beast with CSP Channels in JavaScript](https://jlongster.com/Taming-the-Asynchronous-Beast-with-CSP-in-JavaScript)


