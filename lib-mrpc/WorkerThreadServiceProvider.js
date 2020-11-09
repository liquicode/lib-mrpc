'use strict';


/*
NOTES:
	- Requires `Node.js v12 LTS`
	- Can be used with `Node.js v10.5.0`, but requires Node to be run with the `--experimental-worker` flag.
	- There are certain restrictions to code running in a Worker,
		see: https://nodejs.org/docs/latest-v12.x/api/worker_threads.html#worker_threads_class_worker
	- There are certain restrictions to the CommandParameters passed to code running in a Worker,
		see: https://nodejs.org/docs/latest-v12.x/api/worker_threads.html#worker_threads_port_postmessage_value_transferlist
REFS:
	https://nodejs.org/docs/latest-v12.x/api/worker_threads.html
	https://blog.logrocket.com/node-js-multithreading-what-are-worker-threads-and-why-do-they-matter-48ab102f8b10/
	https://blog.logrocket.com/a-complete-guide-to-threads-in-node-js-4fa3898fe74f/
	https://www.freecodecamp.org/news/how-to-limit-concurrent-operations-in-javascript-b57d7b80d573/
*/


const LIB_ENDPOINTS_MANAGER = require( './EndpointsManager.js' );
const
	{
		Worker,
		isMainThread,
		parentPort,
		workerData
	} = require( 'worker_threads' );


/*
let Options =
{
	max_threads: 10,
};
*/


exports.WorkerThreadServiceProvider =
	function WorkerThreadServiceProvider( ServiceName, Options )
	{
		return {


			//---------------------------------------------------------------------
			ServiceName: ServiceName,
			Options: Options,
			Endpoints: LIB_ENDPOINTS_MANAGER.NewEndpoints(),
			IsPortOpen: false,


			//---------------------------------------------------------------------
			// A service opens a port to listen for connections.
			OpenPort:
				async function OpenPort()
				{
					this.IsPortOpen = true;
					return;
				},


			//---------------------------------------------------------------------
			// A service can close its port to stop listening for connections.
			ClosePort:
				async function ClosePort()
				{
					this.IsPortOpen = false;
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
				async function CallEndpoint( EndpointName, CommandParameters, ReplyCallback = null ) 
				{
					// Validate that the endpoint exists.
					if ( !this.Endpoints.EndpointExists( EndpointName ) )
					{
						throw new Error( `The endpoint [${EndpointName}] does not exist within [${this.ServiceName}].` );
					}
					// Invoke the endpoint.
					try
					{
						let endpoint_handler = this.Endpoints.Endpoints[ EndpointName ].Handler;
						let endpoint_handler_script = endpoint_handler.toString();
						let thread_script =
							`
							const { parentPort, workerData } = require( 'worker_threads' );
							let result =
							(
								${endpoint_handler_script}
							)( workerData );
							parentPort.postMessage( result );
							`;
						let worker = new Worker(
							thread_script,
							{
								eval: true,
								workerData: CommandParameters,
							}
						);
						if ( ReplyCallback )
						{
							worker.once( 'message', ( reply ) => ReplyCallback( null, reply ) );
							worker.once( 'error', ( error ) => ReplyCallback( error, null ) );
						}
						else
						{
							worker.once( 'error', ( error ) => { throw error; } );
						}
						// worker.postMessage( CommandParameters );
					}
					catch ( error )
					{
						if ( ReplyCallback ) { ReplyCallback( error, null ); }
					}
					// Return, OK.
					return;
				},

		};
		return;
	};


