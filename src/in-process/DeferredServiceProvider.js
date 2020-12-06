'use strict';


const LIB_SERVICE_PROVIDER = require( '../ServiceProvider' );


function DeferredServiceProvider( ServiceName, Options )
{

	//---------------------------------------------------------------------
	let service = LIB_SERVICE_PROVIDER.ServiceProvider( ServiceName, Options );


	//---------------------------------------------------------------------
	service.process_next_message =
		async () =>
		{
			if ( !service.IsPortOpen ) { return; }
			// Dequeue the next message.
			let message = service.MessageManager.NextMessage();
			if ( message ) 
			{
				// Invoke the endpoint.
				try
				{
					let result = await service.EndpointManager.HandleEndpoint( message.EndpointName, message.CommandParameters );
					if ( message.ReplyCallback ) { message.ReplyCallback( null, result ); }
				}
				catch ( error )
				{
					if ( message.ReplyCallback ) { message.ReplyCallback( error, null ); }
				}
			}
			setImmediate( service.process_next_message );
			return;
		};


	//---------------------------------------------------------------------
	service.DefaultOptions = () => { return {}; };


	//---------------------------------------------------------------------
	// A service opens a port to listen for connections.
	service.OpenPort =
		async () =>
		{
			return new Promise(
				async ( resolve, reject ) => 
				{
					service.IsPortOpen = true;
					service.process_next_message();
					// Complete the function.
					resolve( true );
					return;
				} );
		};


	//---------------------------------------------------------------------
	// A service can close its port to stop listening for connections.
	service.ClosePort =
		async () =>
		{
			return new Promise(
				async ( resolve, reject ) => 
				{
					service.IsPortOpen = false;
					let message_count = service.MessageManager.Messages.length;
					if ( message_count > 0 )
					{
						// throw new Error( `There are still [${message_count}] messages left in the queue.` );
						console.warn( `DeferredServiceProvider Warning: The port was closed but there are still [${message_count}] messages left in the queue.` );
					}
					// Complete the function.
					resolve( true );
					return;
				} );
		};


	//---------------------------------------------------------------------
	// A service has endpoints which can be called.
	service.AddEndpoint =
		async ( EndpointName, CommandFunction ) =>
		{
			return new Promise(
				async ( resolve, reject ) => 
				{
					// Make sure service endpoint doesn't already exist.
					if ( service.EndpointManager.EndpointExists( EndpointName ) )
					{
						// Complete the function.
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
					// Build the message.
					let message =
					{
						EndpointName: EndpointName,
						CommandParameters: CommandParameters,
						ReplyCallback:
							( error, reply ) =>
							{
								if ( CommandCallback ) { CommandCallback( error, reply ); }
								if ( error ) { reject( error ); }
								else { resolve( reply ); }
							},
					};
					// Queue the message.
					service.MessageManager.AddMessage( message );
				} );
		};


	//---------------------------------------------------------------------
	return service;
};


exports.DeferredServiceProvider = DeferredServiceProvider;
