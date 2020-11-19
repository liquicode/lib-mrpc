
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

```javascript
// Include the library in your source code.
const lib_mrpc = require( '@liquicode/lib-mrpc' );

// Create a service provider for local development.
let service = lib_rpc.ImmediateServiceProvider( 'My Service' );
// Use different service providers to communicate with your service
// over http, a message queue, etc.

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
let result = await service.CallEndpoint( 'My Service', 'Multiply', { arg1: 6, arg2: 7 },
	( Err, Reply ) =>
	{
		if ( Err ) { throw Err; }
		console.log( '6 * 7 = ' +  Reply.result );
		return;
	} );
console.log( '6 * 7 = ' +  result );
```

## Documentation

- [Full Documentation](http://lib-mrpc.liquicode.com)
- [Samples](https://github.com/liquicode/lib-mrpc/tree/master/samples)
- [Tests](https://github.com/liquicode/lib-mrpc/tree/master/tests)