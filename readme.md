
# lib-mrpc

A transport agnostic message based remote procedure call library designed to facilitate the
evolution and scalability of complex systems.

## Overview

This library allows you to define a number of specific commands (`Endpoints`) that can be
invoked, regardless of location, using a transport abstraction (`ServiceProvider`).
An `Endpoint` represents a function that does specific work for an application.


## Installation

```bash
npm install @liquicode/lib-mrpc
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
	return Parameters.arg1 * Parameters.arg2;
}

// Add the function to your service.
await service.AddEndpoint( 'Multiply', multiply_function );

// Call the service function.
let result = await service.CallEndpoint( 'My Service', 'Multiply', { arg1: 6, arg2: 7 } );
console.log( '6 * 7 = ' +  result ); // 6 * 7 = 42
```


## Remote Functions

This example takes the same functionality of a simple multiply function and lets you 
call it remotely via a message queue server that supports the `amqp` protocol
(e.g. [RabbitMQ](https://www.rabbitmq.com/)).

***server.js***:
```javascript
// Instantiate a ServiceProvider which listens for commands on a message queue server.
const lib_mrpc = require( '@liquicode/lib-mrpc' );
let options = { server: 'amqp://my-rabbitmq' };
let service = lib_mrpc.AmqpLibServiceProvider( 'My Service', options );
service.OpenPort();

// Define a function for the service.
function multiply_function( Parameters )
{
	return Parameters.arg1 * Parameters.arg2;
}

// Add the Multiply function to our service.
await service.AddEndpoint( 'Multiply',
	( Parameters ) =>
	{
		return Parameters.arg1 * Parameters.arg2;
	} );
```

***client.js***:
```javascript
// Instantiate a connection to the server via the same message queue.
const lib_mrpc = require( '@liquicode/lib-mrpc' );
let options = { server: 'amqp://my-rabbitmq' };
let service = lib_mrpc.AmqpLibServiceProvider( 'My Service', options );
service.OpenPort();

// Call the service function. This code is identical regardless of which ServiceProvider begin used.
let result = await service.CallEndpoint( 'My Service', 'Multiply', { arg1: 6, arg2: 7 } );
console.log( '6 * 7 = ' +  result ); // 6 * 7 = 42
```




## Documentation

- [Documentation](http://lib-mrpc.liquicode.com)
- [Samples](https://github.com/liquicode/lib-mrpc/tree/master/samples)
- [Tests](https://github.com/liquicode/lib-mrpc/tree/master/tests)


## TODO

- Define strict semantics regarding `OpenPort`.
	Should it be called before any calls to `AddEndpoint`?
- Ensure that all `ServiceProvider`s remote any errors thrown by `Endpoint` functions.
- Develop the `ServiceTransaction` object.
	- `StartTransaction`: Begin aggregating calls to `Endpoint`s.
	- `CommitTransaction`: Execute aggregated calls to `Endpoint`s.
	- `RollbackTransaction`: Use `Undo` data to undo the effects of all service calls.
