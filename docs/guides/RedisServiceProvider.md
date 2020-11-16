
# RedisServiceProvider

A `ServiceProvider` implementation for the `redis` message broker.


## Overview

Requires the [redis](https://github.com/CompassPHS/tortoise) third-party library.
Tested with [redis](https://www.redis.io).


## Options

***Default Options***
```javascript
{
	host: null,
	port: null,
	path: null,
	url: 'redis://localhost:6379',
}
```

## Installation



## Usage

### Simple Usage

```javascript
// Gain a reference to the ServiceProvider constructor function.
const RedisServiceProvider = require( 'lib-mrpc/RedisServiceProvider' ).RedisServiceProvider;
// Create a new instance of the ServiceProvider (uses default option values).
let service = new RedisServiceProvider( 'My Service' );
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

## Resources

- [redis library github](https://github.com/NodeRedis/node-redis)
- [amqp protocol](https://www.amqp.org)
- [redis server](https://www.redis.io)

