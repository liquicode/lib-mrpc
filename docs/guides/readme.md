
# lib-mrpc (v0.0.2)

A transport agnostic message based remote procedure call library designed to facilitate the
evolution and scalability of complex systems.

## Overview

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


## Installation

```bash
npm install --save @liquicode/lib-mrpc
```

## Simple Usage

This simple example creates an `ImmediateServiceProvider`, adds a multiply function
to it, and then calls that multiply function.
Since we are using the `ImmediateServiceProvider`, the multiply function executes
immediately and returns its value directly to the calling code.
This general pattern is used regardless of which underlying `ServiceProvider`
implemntation is being used.

```javascript
// Include the library in your source code.
const lib_mrpc = require( '@liquicode/lib-mrpc' );

// Create a service provider for local development.
let service = lib_mrpc.ImmediateServiceProvider( 'My Service' );

// Activate the service.
service.OpenPort();

// Define a function for the service.
function multiply_function( Parameters )
{
	return (Parameters.arg1 * Parameters.arg2);
}

// Add the function to your service.
await service.AddEndpoint( 'Multiply', multiply_function );

// Call the service function.
let result = await service.CallEndpoint( 'My Service', 'Multiply', { arg1: 6, arg2: 7 } );
console.log( '6 * 7 = ' +  result ); // 6 * 7 = 42
```


## Remote Functions

This example takes the same functionality (i.e. a multiply function) and lets you 
call it remotely via a message queue server that supports the `amqp` protocol
(e.g. [RabbitMQ](https://www.rabbitmq.com/)).
Remoting the function has minimal impact on your code as all that is required
is to change the type of `ServiceProvider` that you use. The function signatures
and mechanics are identical across all types of `ServiceProvider`.

***server.js***:

```javascript
// Instantiate a ServiceProvider which listens for commands on a message queue server.
const lib_mrpc = require( '@liquicode/lib-mrpc' );
let options = { server: 'amqp://my-rabbitmq' };
let service = lib_mrpc.AmqpLibServiceProvider( 'My Service', options );
service.OpenPort();

// Add the Multiply function to our service.
await service.AddEndpoint( 'Multiply',
	( Parameters ) =>
	{
		return (Parameters.arg1 * Parameters.arg2);
	} );
```

***client.js***:

```javascript
// Instantiate a connection to the server via the same message queue.
const lib_mrpc = require( '@liquicode/lib-mrpc' );
let options = { server: 'amqp://my-rabbitmq' };
let service = lib_mrpc.AmqpLibServiceProvider( 'My Service', options );
service.OpenPort();

// Call the service function. This code is identical regardless of which ServiceProvider being used.
let result = await service.CallEndpoint( 'My Service', 'Multiply', { arg1: 6, arg2: 7 } );
console.log( '6 * 7 = ' +  result ); // 6 * 7 = 42
```


## Remoting Errors

Just like any other function, an `Endpoint` can throw errors (intentional or otherwise).
`lib-mrpc` catches these errors and then remotes them back to the calling function.

The following example uses `RedisServiceProvider` to communicate with a remote service
via an existing [redis](https://www.redis.io) server.

In this case, rather than doing something tremendously useful in our `Endpoint`, we will just throw an error.

***server.js***:

```javascript
const lib_mrpc = require( '@liquicode/lib-mrpc' );
let service = lib_mrpc.RedisServiceProvider( 'My Service', { server: 'redis://my-redis' } );
service.OpenPort();
await service.AddEndpoint( 
	'Gives Errors',
	( Parameters ) =>
	{
		throw new Error('Error something about something.'); // Just throw an error.
	} );
```

***client.js***:

```javascript
const lib_mrpc = require( '@liquicode/lib-mrpc' );
let service = lib_mrpc.RedisServiceProvider( 'My Service', { server: 'redis://my-redis' } );
service.OpenPort();

// Call the service function, expect errors.
try
{
	await service.CallEndpoint( 'My Service', 'Gives Errors', {} );
}
catch( error )
{
	console.log( error.message ); // "Error something about something."
}

// Or, call the service function and get errors in the callback.
service.CallEndpoint( 'My Service', 'Gives Errors', {},
	( error, reply ) =>
	{
		if( error )
		{
			console.log( error.message ); // "Error something about something."
		}
		else
		{
			console.log( "What am I doing here?" ); // This doesn't get executed.
		}
	} );
```


## More Documentation

- [lib-mrpc Documentation](http://lib-mrpc.liquicode.com)
- [lib-mrpc Samples](https://github.com/liquicode/lib-mrpc/tree/master/samples)
- [lib-mrpc Tests](https://github.com/liquicode/lib-mrpc/tree/master/tests)

