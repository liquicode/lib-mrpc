
# ServiceProvider

## Overview

`ServiceProvider` is the base class used by the various `ServiceProvider` implementations.
It stores the name of the service, any required connection options, a set of callable `Endpoints`, and a set of incoming `Messages`.

`lib-mrpc` offers a number of different `ServiceProvider` implementations.
Implementations can store and execute `Endpoints` in many different ways.
There are three categories of service provider which group implementations according to how and
where `Endpoints` are executed:

- Native Service Providers: `Endpoints` execute within the same process as the calling code.
- Local Service Providers: `Endpoints` execute on the same machine as the calling code.
- Remote Service Providers: `Endpoints` execute on a different machine as the calling code.


## ServiceProvider Variables

- `ServiceName`: A name for this service.
- `Options`: Implementation specific options. e.g. connection info, etc.
- `IsPortOpen`: Boolean flag indicating a successfully opened port.
- `EndpointManager`: Management interface for a set of callable named endpoints.
- `MessageManager`: Management interface for a fifo queue of incoming messages.


## ServiceProvider Functions


### ServiceProvider Constructor Functions

- `function ServiceProvider( ServiceName, Options )`
	- Constructor function of a ServiceProvider implementation.
	- Returns a newly created instance of the requested service provider.
	- `ServiceName`: A name for the service, shared by `Endpoint` code and calling code.
	- `Options`: Implementation specific options. e.g. connection info, etc.


### ServiceProvider Convenience Functions

These are some convenience functions to be used by `ServiceProvider` implementations and user applications.

- `function ApplyDefaultOptions( UserOptions )`:
	This function is used internally by ServiceProvider constructurs to merge application supplied option values with default option values.

- `function RandomID( Size )`
	Returns a unique identifier string of `Size` characters.

- `async function Sleep( Milliseconds )`
	Sleeps for a certain number of milliseconds.

- `async function WaitWhile( Condition )`
	Wait/sleep while a certain condition is `true`.

- `async function WaitUntil( Condition )`
	Wait/sleep until a certain condition is `true`.


### ServiceProvider Virtual Functions

These functions are "overridden" by specific `ServiceProvider` implementations.

- `function DefaultOptions()`
	- Supply sensible defaults for the `ServiceProvider` Options object.

- `async function OpenPort()`
	- Performs any work needed to initialize the transport mechanism and begin sending/receiving requests.
	- This function does not return a value.
	- It is reccomended to `await` for completion of this function.
	- This function must be called prior to any calls to `AddEndpoint` or `CallEndpoint`.

- `async function ClosePort()`
	- Shuts down any transport mechanisms and releases any remaining resources.
	- Also de-registers all `Endpoints`.
	- This function does not return a value.
	- It is reccomended to `await` for completion of this function.

- `async function AddEndpoint( EndpointName, CommandFunction )`
	- Used by "server" code to host callable `Endpoints`.
	- Function Parameters:
		- `EndpointName`: The unique name of this endpoint within this service.
		- `CommandFunction`: The function to execute when this endpoint is called.
	- This function does not return a value.
	- It is reccomended to `await` for completion of this function.

- `async function CallEndpoint( EndpointName, CommandParameters, CommandCallback = null )`
	- Used to invoke a (server) `Endpoint` by the (client) calling code.
	- Function Parameters:
		- `EndpointName`: The name of the endpoint on this service to call.
		- `CommandParameters`: The parameters to pass to the `Endpoint`.
		- `CommandCallback`: A function to execute when the reply from the `Endpoint` has been received.
			- The `CommandCallback` function should have the following signature: `function CommandCallback( Error, Reply )`.
	- If this function is `await`ed, the return value will be whatever was returned from the `Endpoint`.
		Otherwise, the `Endpoint` results can be obtained via the `CommandCallback` callback function.
	- If `CommandCallback` is supplied and the function is also `await`ed on, then `CommandCallback` will be executed first,
		supplying any result or error obtained from the `Endpoint` to the callback code.
		The function will then complete and return the `Endpoint` results or throw any errors from the `Endpoint`.


## ServiceProvider Flow

- Open Command Channel
- Receive Command Message
	- Process Command Message
	- Open Reply Channel
	- Send Reply Message
	- Close Reply Channel
- Send Command Message
	- Open Reply Channel
	- Receive Reply Message
	- Close Reply Channel
	- Process Reply Message
- Close Command Channel
