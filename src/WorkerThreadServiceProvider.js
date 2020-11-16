'use strict';

const LIB_SERVICE_PROVIDER = require( './ServiceProvider' );

/*
NOTES:
	- Requires `Node.js v12 LTS`
	- Can be used with `Node.js v10.5.0`, but requires Node to be run with the `--experimental-worker` flag.
	- There are certain restrictions to code running in a Worker,
		see: https://nodejs.org/docs/latest-v12.x/api/worker_threads.html#worker_threads_class_worker
	- There are certain restrictions to the CommandParameters passed to code running in a Worker,
		see: https://nodejs.org/docs/latest-v12.x/api/worker_threads.html#worker_threads_port_postmessage_value_transferlist

LIMITATIONS:
	- Endpoint functions cannot `require` any libraries/packages.
	- Endpoint functions cannot be `async`.

REFS:
	https://nodejs.org/docs/latest-v12.x/api/worker_threads.html
	https://blog.logrocket.com/node-js-multithreading-what-are-worker-threads-and-why-do-they-matter-48ab102f8b10/
	https://blog.logrocket.com/a-complete-guide-to-threads-in-node-js-4fa3898fe74f/
	https://www.freecodecamp.org/news/how-to-limit-concurrent-operations-in-javascript-b57d7b80d573/
*/


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


function WorkerThreadServiceProvider( ServiceName, Options )
{

	//---------------------------------------------------------------------
	let service = LIB_SERVICE_PROVIDER.ServiceProvider( ServiceName, Options );


	//---------------------------------------------------------------------
	service.OpenPort =
		async () =>
		{
			return new Promise(
				async ( resolve, reject ) => 
				{
					service.IsPortOpen = true;
					// Complete the function.
					resolve( true );
					return;
				} );
		};


	//---------------------------------------------------------------------
	service.ClosePort =
		async () =>
		{
			return new Promise(
				async ( resolve, reject ) => 
				{
					service.IsPortOpen = false;
					// Complete the function.
					resolve( true );
					return;
				} );
		};


	//---------------------------------------------------------------------
	service.AddEndpoint =
		async ( EndpointName, CommandFunction ) =>
		{
			return new Promise(
				async ( resolve, reject ) => 
				{
					// Make sure this endpoint doesn't already exist.
					if ( service.EndpointManager.EndpointExists( EndpointName ) )
					{
						reject( new Error( `The endpoint [${EndpointName}] already exists within [${service.ServiceName}].` ) );
						return;
					}
					// Register the endpoint.
					let endpoint = service.EndpointManager.AddEndpoint( EndpointName, CommandFunction );
					// Complete the function.
					resolve( true );
					return;
				} );
		};


	//---------------------------------------------------------------------
	service.CallEndpoint =
		async ( EndpointName, CommandParameters, CommandCallback = null ) =>
		{
			return new Promise(
				async ( resolve, reject ) => 
				{
					// Validate that the endpoint exists.
					if ( !service.EndpointManager.EndpointExists( EndpointName ) )
					{
						reject( new Error( `The endpoint [${EndpointName}] does not exist within [${service.ServiceName}].` ) );
						return;
					}
					// Invoke the endpoint.
					try
					{
						let endpoint_handler = service.EndpointManager.Endpoints[ EndpointName ].Handler;
						let endpoint_handler_script = endpoint_handler.toString();
						let thread_script = null;
						thread_script = `
						const { parentPort, workerData } = require( 'worker_threads' );
						let result =
						(
							${endpoint_handler_script}
						)( workerData );
						parentPort.postMessage( result );
						`;
						// if ( endpoint_handler_script.startsWith( 'function ' ) )
						// {
						// 	thread_script = `
						// 				const { parentPort, workerData } = require( 'worker_threads' );
						// 				let result =
						// 				(
						// 					${endpoint_handler_script}
						// 				)( workerData );
						// 				parentPort.postMessage( result );
						// 				`;
						// }
						// else if ( endpoint_handler_script.startsWith( 'async ' ) )
						// {
						// 	thread_script = `
						// 		const { parentPort, workerData } = require( 'worker_threads' );
						// 		let result = await
						// 		(
						// 			${endpoint_handler_script}
						// 		)( workerData );
						// 		parentPort.postMessage( result );
						// 		`;
						// }
						// else
						// {
						// 	reject( new Error( `Unknown function signature in [${endpoint_handler_script}].` ) );
						// 	return;
						// }
						let worker = new Worker(
							thread_script,
							{
								eval: true,
								workerData: CommandParameters,
							}
						);
						worker.once( 'message',
							( reply ) => 
							{
								if ( CommandCallback ) { CommandCallback( null, reply ); }
								resolve( reply );
							} );
						worker.once( 'error',
							( error ) => 
							{
								if ( CommandCallback ) { CommandCallback( error, null ); }
								reject( error );
							} );
					}
					catch ( error )
					{
						if ( CommandCallback ) { CommandCallback( error, null ); }
						reject( error );
					}
				} );
		};


	//---------------------------------------------------------------------
	return service;
};


exports.WorkerThreadServiceProvider = WorkerThreadServiceProvider;
