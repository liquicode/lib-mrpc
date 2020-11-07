'use strict';


/*
NOTES:
	- Requires `Node.js v12 LTS`
	- Can be used with `Node.js v10.5.0`. Requires Node to be run with the `--experimental-worker` flag.
REFS:
	https://nodejs.org/docs/latest-v12.x/api/worker_threads.html
	https://blog.logrocket.com/node-js-multithreading-what-are-worker-threads-and-why-do-they-matter-48ab102f8b10/
	https://blog.logrocket.com/a-complete-guide-to-threads-in-node-js-4fa3898fe74f/
	https://www.freecodecamp.org/news/how-to-limit-concurrent-operations-in-javascript-b57d7b80d573/
*/


const LIB_ENDPOINTS_MANAGER = require( './EndpointsManager.js' );


exports.WorkerThreadServiceProvider =
	function WorkerThreadServiceProvider( ServiceName, Options )
	{
		return {


			//---------------------------------------------------------------------
			ServiceName: ServiceName,
			Options: Options,
			Endpoints: LIB_ENDPOINTS_MANAGER.NewEndpoints(),
			is_port_open: false,


			//---------------------------------------------------------------------
			// A service opens a port to listen for connections.
			OpenPort:
				async function OpenPort()
				{
					this.is_port_open = true;
					return;
				},


			//---------------------------------------------------------------------
			// A service can close its port to stop listening for connections.
			ClosePort:
				async function ClosePort()
				{
					this.is_port_open = false;
					return;
				},


			//---------------------------------------------------------------------
			// A service has endpoints which can be called.
			AddEndpoint:
				async function AddEndpoint( EndpointName, CommandFunction ) 
				{
					// Make sure this endpoint doesn't already exist.
					if ( this.Endpoints.EndpointExists( EndpointName ) )
					{
						throw new Error( `The endpoint [${EndpointName}] already exists within [${this.ServiceName}].` );
					}
					// Register the endpoint.
					let endpoint = this.Endpoints.AddEndpoint( EndpointName, CommandFunction );
					// Return, OK.
					return;
				},


			//---------------------------------------------------------------------
			DestroyEndpoint:
				async function DestroyEndpoint( EndpointName ) 
				{
					// Deregister the endpoint.
					this.Endpoints.RemoveEndpoint( EndpointName );
					// Return, OK.
					return;
				},


			//---------------------------------------------------------------------
			CallEndpoint:
				async function CallEndpoint( EndpointName, CommandParameters, ReplyCallback ) 
				{
					// Validate that the endpoint exists.
					if ( !this.Endpoints.EndpointExists( EndpointName ) )
					{
						throw new Error( `The endpoint [${EndpointName}] does not exist within [${this.ServiceName}].` );
					}
					// Invoke the endpoint.
					try
					{
						// let result = await this.Endpoints[ EndpointName ].Handler( CommandParameters );
						let result = await this.Endpoints.HandleEndpoint( EndpointName, CommandParameters );
						ReplyCallback( null, result );
					}
					catch ( error )
					{
						ReplyCallback( error, null );
					}
					// Return, OK.
					return;
				},

		};
		return;
	};


