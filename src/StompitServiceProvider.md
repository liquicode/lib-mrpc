
# StompitServiceProvider


***Kinda non-functional at the moment.***



# StompitServiceProvider


## Overview

`stompit` is a 3rd party client for message queues that support the `stomp` protocol.
 
`lib-mrpc` utilizes `stompit` to route commands and replies between
client and server instances of a `StompitServiceProvider` object.

- You can read more about the `stomp` protocol here: [stomp protocol](https://stomp.github.io/)

- Code and documentation for `stompit` is here: [stompit client](https://github.com/gdaws/stompit)

- Additional `stompit` API documentation is here: [stompit client API](https://gdaws.github.io/stompit/api/)

## Installation

This `ServiceProvider` is included in the `@liquicode/lib-mrpc` package:
```bash
npm install --save @liquicode/lib-mrpc
```

The `StompitServiceProvider` type also requires that you have the `stompit` client library installed:
```bash
npm install --save stompit
```

If you also need a `stomp` server to test/develop with, you can easily use docker to get one started:
```bash
docker run -d -p 61616:61616 -p 8161:8161 rmohr/activemq
```
This will download and start an `ActiveMQ` server on your machine (listening at port 61616).

- For information on docker, see here: [docker](https://www.docker.com/)

- The docker activemq image is here: [docker activemq](https://hub.docker.com/r/rmohr/activemq)


## Usage

### Creating StompitServiceProvider Objects

A new `StompitServiceProvider` object can be created by gaining a reference to the `lib-mrpc` library
and calling the `StompitServiceProvider()` factory function:
```javascript
const lib_mrpc = require( '@liquicode/lib-mrpc' );
let service = lib_mrpc.StompitServiceProvider( 'My Service' );
```

The `StompitServiceProvider()` factory function takes a name for the service as the first
parameter and an optional `Options` object in the second parameter.


### Simple Usage

```javascript
// Gain a reference to the ServiceProvider constructor function.
const lib_mrpc = require( '@liquicode/lib-mrpc' );
// Create a new instance of the ServiceProvider (uses default option values).
let service = lib_mrpc.StompitServiceProvider( 'My Service' );
// Connect to the message broker (e.g. RabbitMQ server).
await service.OpenPort();
// Add some endpoints to our service.
await service.AddEndpoint( 'echo', Request => Request );
await service.AddEndpoint( 'sum', function ( Request ) { return Request.arg1 + Request.arg2 } );
// Call our endpoints.
await service.CallEndpoint( 'echo', "Hello World!", function ( Reply ) { console.log( Reply ); } );
await service.CallEndpoint( 'sum', { arg1: 5, arg2: 4 }, function ( Reply ) { console.log( Reply ); } );
// Shutdown.
await service.ClosePort();
```


### StompitServiceProvider Options

***Default Options***
```javascript
{
	host: 'localhost',
	port: 61616,
	connectHeaders:
	{
		host: '/',
		login: 'admin',
		passcode: 'admin',
		'heart-beat': '5000,5000',
	}
}
```


## Implementation

The `StompitServiceProvider` object implements all of the `ServiceProvider` methods.

- `async function OpenPort()`
	- Connects to the message queue.
- `async function ClosePort()`
	- Unsubscribes and shuts down all `Endpoint` command channels.
	- Disconnects from the message queue.
- `async function AddEndpoint( EndpointName, CommandFunction )`
	- Creates a new channel to receive commands on and then subscribes to it.
- `async function CallEndpoint( EndpointName, CommandParameters, CommandCallback = null )`
	- Creates a reply channel to receive the command's response and then subscribes to it.
	- Connects to the `Endpoint` command channel and sends a command to the service.
	- The reply channel is shut down as soon as it receives a reply.

