'use strict';

const LIB_SERVICE_PROVIDER = require( './ServiceProvider' );


function DeferredServiceProvider( ServiceName, Options )
{

	//---------------------------------------------------------------------
	let service = LIB_SERVICE_PROVIDER.ServiceProvider( ServiceName, Options );


	//---------------------------------------------------------------------
	service.process_next_message =
		async () =>
		{
			if ( !service.MessageManager.PeekMessage() ) { return; }
			// Dequeue the next message.
			let message = service.MessageManager.NextMessage();
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
			return;
		};


	//---------------------------------------------------------------------
	// A service opens a port to listen for connections.
	service.OpenPort =
		async () =>
		{
			service.IsPortOpen = true;
			while ( service.IsPortOpen )
			{
				setImmediate( () => service.process_next_message() );
				// await process_next_message();
				await new Promise( resolve => setTimeout( resolve, 1 ) );
			}
			return;
		};


	//---------------------------------------------------------------------
	// A service can close its port to stop listening for connections.
	service.ClosePort =
		async () =>
		{
			service.IsPortOpen = false;
			let message_count = service.Messages.length;
			if ( message_count > 0 )
			{
				// throw new Error( `There are still [${message_count}] messages left in the queue.` );
				console.warn( `The port was closed but there are still [${message_count}] messages left in the queue.` );
			}
			return;
		};


	//---------------------------------------------------------------------
	// A service has endpoints which can be called.
	service.AddEndpoint =
		async ( EndpointName, CommandFunction ) =>
		{
			// Make sure service endpoint doesn't already exist.
			if ( service.EndpointManager.EndpointExists( EndpointName ) )
			{
				throw new Error( `The endpoint [${EndpointName}] already exists within [${service.ServiceName}].` );
			}
			// Register the endpoint.
			let endpoint = service.EndpointManager.AddEndpoint( EndpointName, CommandFunction );
			// Return, OK.
			return;
		};


	//---------------------------------------------------------------------
	service.CallEndpoint =
		async ( EndpointName, CommandParameters, ReplyCallback = null ) =>
		{
			// Validate that the endpoint exists.
			if ( !service.EndpointManager.EndpointExists( EndpointName ) )
			{
				throw new Error( `The endpoint [${EndpointName}] does not exist within [${service.ServiceName}].` );
				return;
			}
			// Build the message.
			let message =
			{
				EndpointName: EndpointName,
				CommandParameters: CommandParameters,
				ReplyCallback: ReplyCallback,
			};
			// Queue the message.
			service.MessageManager.AddMessage( message );
			// Return, OK.
			return;
		};


	//---------------------------------------------------------------------
	return service;
};


exports.DeferredServiceProvider = DeferredServiceProvider;
