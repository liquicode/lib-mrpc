'use strict';

const LIB_SERVICE_PROVIDER = require( './ServiceProvider' );

const LIB_TORTOISE = require( 'tortoise' );
const LIB_UNIQID = require( 'uniqid' );


const DEFAULT_OPTIONS =
{
	server: 'amqp://guest:guest@localhost:5672',
	connect_options:
	{
		connectRetries: 30,
		connectRetryInterval: 1000,
	},
	command_queue_options:
	{
		exclusive: false,
		durable: false,
		autoDelete: true,
	},
	reply_queue_options:
	{
		exclusive: false,
		durable: false,
		autoDelete: true,
	},
};

function merge_from( Options, Defaults )
{
	let keys = Object.keys( Defaults );
	for ( let index = 0; index < keys.length; index++ )
	{
		let key = keys[ index ];
		if ( typeof Options[ key ] === 'undefined' )
		{
			Options[ key ] = Defaults[ key ];
		}
		else if ( typeof Options[ key ] === 'object' )
		{
			merge_from( Options[ key ], Defaults[ key ] );
		}
	}
	return;
}

function TortoiseServiceProvider( ServiceName, Options )
{

	//---------------------------------------------------------------------
	let service = LIB_SERVICE_PROVIDER.ServiceProvider( ServiceName, Options );


	//---------------------------------------------------------------------
	service.QueueClient = null;


	//---------------------------------------------------------------------
	// A service opens a port to listen for connections.
	service.OpenPort =
		async () =>
		{
			service.Options = service.Options || DEFAULT_OPTIONS;
			merge_from( service.Options, DEFAULT_OPTIONS );
			service.QueueClient = new LIB_TORTOISE(
				service.Options.server,
				service.Options.connect_options );
			service.IsPortOpen = true;
			return;
		};


	//---------------------------------------------------------------------
	// A service can close its port to stop listening for connections.
	service.ClosePort =
		async () =>
		{
			let keys = Object.keys( service.EndpointManager.Endpoints );
			for ( let index = 0; index < keys.length; index++ )
			{
				let endpoint = service.EndpointManager.Endpoints[ keys[ index ] ];
				await endpoint.Channel.close();
			}
			await service.Sleep( 1000 );
			await service.QueueClient.destroy();
			service.IsPortOpen = false;
			return;
		};


	//---------------------------------------------------------------------
	// A service has endpoints which can be called.
	service.AddEndpoint =
		async ( EndpointName, CommandFunction ) =>
		{
			// Make sure this endpoint doesn't already exist.
			if ( service.EndpointManager.EndpointExists( EndpointName ) )
			{
				throw new Error( `The endpoint [${EndpointName}] already exists within [${service.ServiceName}].` );
			}
			// Subscribe to the message queue.
			let channel = await service.QueueClient
				.queue( `/queue/${service.ServiceName}/${EndpointName}`, service.Options.command_queue_options )
				.prefetch( 1 )
				.subscribe(
					async function ( message, ack, nack )
					{
						try
						{
							let request = JSON.parse( message );
							let reply_id = request.CommandCallback;
							let result = await service.EndpointManager.HandleEndpoint( request.EndpointName, request.CommandParameters );
							if ( reply_id )
							{
								await service.QueueClient
									.queue( `/queue/${service.ServiceName}/${EndpointName}/${reply_id}`, service.Options.reply_queue_options )
									.publish( JSON.stringify( result ) );
							}
							ack();
						}
						catch ( error )
						{
							console.error( Error.message, error );
							nack( false );
						}
						finally
						{
						}
					} );
			// Register the endpoint.
			let endpoint = service.EndpointManager.AddEndpoint( EndpointName, CommandFunction );
			endpoint.Channel = channel;
			// Return, OK.
			return;
		};


	//---------------------------------------------------------------------
	service.CallEndpoint =
		async ( EndpointName, CommandParameters, CommandCallback ) =>
		{
			// Validate that the endpoint exists.
			if ( !service.EndpointManager.EndpointExists( EndpointName ) )
			{
				throw new Error( `The endpoint [${EndpointName}] does not exist within [${service.ServiceName}].` );
			}
			// Setup the reply channel
			let reply_id = LIB_UNIQID();
			let channel = await service.QueueClient
				.queue( `/queue/${service.ServiceName}/${EndpointName}/${reply_id}`, service.Options.reply_queue_options )
				.prefetch( 1 )
				.subscribe(
					async function ( message, ack, nack )
					{
						try
						{
							let reply = JSON.parse( message );
							CommandCallback( null, reply );
							ack();
						}
						catch ( error )
						{
							nack( false );
							CommandCallback( error, null );
						}
						finally
						{
							await channel.close();
							// debugger;
						}
						return;
					} );
			// Build the message.
			let message =
			{
				EndpointName: EndpointName,
				CommandParameters: CommandParameters,
				CommandCallback: reply_id,
			};
			// Queue the message.
			await service.QueueClient
				.queue( `/queue/${service.ServiceName}/${EndpointName}`, service.Options.command_queue_options )
				.publish( message );
			// Return, OK.
			return;
		};

	return service;
};


exports.TortoiseServiceProvider = TortoiseServiceProvider;

