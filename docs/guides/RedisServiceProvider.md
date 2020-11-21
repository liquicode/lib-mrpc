
# RedisServiceProvider


## Overview

redis is in-memory data structure store server which also has basic Pub/Sub capabilties.

`lib-mrpc` utilizes the redis Pub/Sub functions to route commands and replies between
client and server instances of a `RedisServiceProvider` object.

You can read more about the redis server here: [redis server](https://www.redis.io)

Code and documentation for the redis npm package is here: [redis client](https://github.com/NodeRedis/node-redis)


## Installation

This `ServiceProvider` is included in the `@liquicode/lib-mrpc` package:
```bash
npm install --save @liquicode/lib-mrpc
```

The `RedisServiceProvider` type also requires that you have the `redis` client library installed:
```bash
npm install --save redis
```

If you also need a redis server to test/develop with, you can easily use docker to get one started:
```bash
docker run -d -p 6379:6379 redis
```
This will download and start a redis server on your machine (listening at port 6379).

For information on docker, see here: [docker](https://www.docker.com/)
The docker redis image is here: [docker redis](https://hub.docker.com/_/redis)


## Usage

### Creating RedisServiceProvider Objects

A new `RedisServiceProvider` object can be created by gaining a reference to the `lib-mrpc` library
and calling the `RedisServiceProvider()` factory function:
```javascript
const lib_mrpc = require( '@liquicode/lib-mrpc' );
let service = lib_mrpc.RedisServiceProvider( 'My Service' );
```

The `RedisServiceProvider()` factory function takes a name for the service as the first
parameter and an optional `Options` object in the second parameter.


### Simple Usage

```javascript
// Gain a reference to the ServiceProvider constructor function.
const lib_mrpc = require( '@liquicode/lib-mrpc' );
// Create a new instance of the ServiceProvider (uses default option values).
let service = lib_mrpc.RedisServiceProvider( 'My Service' );
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


### RedisServiceProvider Options

***Default Options***
```javascript
{
	host: null,
	port: null,
	path: null,
	url: 'redis://localhost:6379',
}
```


## Implementation Notes

The `RedisServiceProvider` object implements all of the `ServiceProvider` methods.

- `async function OpenPort()`
	- Does nothing interesting. Just returns success.
- `async function ClosePort()`
	- Unsubscribes and shuts down all `Endpoint` command channels.
- `async function AddEndpoint( EndpointName, CommandFunction )`
	- Creates a new channel to receive commands on and then subscribes to it.
- `async function CallEndpoint( EndpointName, CommandParameters, CommandCallback = null )`
	- Creates a reply channel to receive the command's response and then subscribes to it.
	- Connects to the `Endpoint`'s command channel and then sends a command to the service.
	- The reply channel is shut down as soon as it receives a reply.

