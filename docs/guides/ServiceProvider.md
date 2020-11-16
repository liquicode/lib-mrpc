
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

- `function ServiceProvider( ServiceName, Options )`
	- Constructor function of a ServiceProvider implementation.
	- Returns a newly created instance of the requested service provider.
	- `ServiceName`: A name for the service, shared by `Endpoint` code and calling code.
	- `Options`: Implementation specific options. e.g. connection info, etc.

- `async function OpenPort()`
	- Performs any work needed to initialize the transport mechanism and begin receiving requests.
	- This function does not return a value.
	- It is reccomended to `await` for completion of this function.

- `async function ClosePort()`
	- Shuts down any transport mechanisms and releases any remaining resources.
	- This function does not return a value.
	- It is reccomended to `await` for completion of this function.

- `async function AddEndpoint( EndpointName, CommandFunction )`
	- Used by "server" code to host callable `Endpoints`.
	- `EndpointName`: The unique name of this endpoint within this service.
	- `CommandFunction`: The function to execute when this endpoint is called.
	- This function does not return a value.
	- It is reccomended to `await` for completion of this function.

- `async function CallEndpoint( EndpointName, CommandParameters, CommandCallback = null )`
	- Used to invoke a (server) `Endpoint` by the (client) calling code.
	- If this function is `await`ed, it will return whatever was returned from the invoked `Endpoint`.
		Otherwise, the `Endpoint` reply can be obtained via the `CommandCallback` function.
	- `EndpointName`: The name of the endpoint on this service to call.
	- `CommandParameters`: The parameters to pass to the `Endpoint`.
	- `CommandCallback`: A function to execute when the reply from the `Endpoint` has been received.
		- The `CommandCallback` function should have the following signature: `function CommandCallback( Error, Reply )`.
	- If `CommandCallback` is supplied and the function is also `await`ed on,
		then `CommandCallback` will be executed first and then the function will complete.

