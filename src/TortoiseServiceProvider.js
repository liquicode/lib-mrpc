'use strict';


const LIB_SERVICE_PROVIDER = require( './ServiceProvider' );
const LIB_TORTOISE = require( 'tortoise' );
const LIB_UNIQID = require( 'uniqid' );


function TortoiseServiceProvider( ServiceName, Options )
{

	//---------------------------------------------------------------------
	let service = LIB_SERVICE_PROVIDER.ServiceProvider( ServiceName, Options );


	//---------------------------------------------------------------------
	service.QueueClient = null;


	//---------------------------------------------------------------------
	service.DefaultOptions =
		() =>
		{
			return {
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
		};


	//---------------------------------------------------------------------
	service.OpenPort =
		async () =>
		{
			return new Promise(
				async ( resolve, reject ) => 
				{
					service.QueueClient = new LIB_TORTOISE(
						service.Options.server,
						service.Options.connect_options );
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
					// Shutdown the endpoints.
					let keys = Object.keys( service.EndpointManager.Endpoints );
					for ( let index = 0; index < keys.length; index++ )
					{
						let endpoint = service.EndpointManager.Endpoints[ keys[ index ] ];
						await endpoint.Channel.close();
					}
					// Disconnect.
					if ( service.QueueClient )
					{
						await service.QueueClient.destroy();
						service.QueueClient = null;
					}
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
									let result = await service.EndpointManager.HandleEndpoint( request.EndpointName, request.CommandParameters );
									if ( request.ReplyID )
									{
										await service.QueueClient
											.queue( `/queue/${service.ServiceName}/${EndpointName}/${request.ReplyID}`, service.Options.reply_queue_options )
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
					// Complete the function.
					resolve( true );
					return;
				} );
		};


	//---------------------------------------------------------------------
	service.CallEndpoint =
		async ( EndpointName, CommandParameters, CommandCallback ) =>
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
									if ( CommandCallback ) { CommandCallback( null, reply ); }
									ack();
									// Complete the function.
									resolve( reply );
								}
								catch ( error )
								{
									nack( false );
									if ( CommandCallback ) { CommandCallback( error, null ); }
									// Complete the function.
									reject( error );
								}
								finally
								{
									await channel.close();
								}
								return;
							} );
					// Build the message.
					let message =
					{
						EndpointName: EndpointName,
						CommandParameters: CommandParameters,
						ReplyID: reply_id,
					};
					// Queue the message.
					await service.QueueClient
						.queue( `/queue/${service.ServiceName}/${EndpointName}`, service.Options.command_queue_options )
						.publish( message );
				} );
		};


	//---------------------------------------------------------------------
	service.Options = service.ApplyDefaultOptions( Options );
	return service;
};


exports.TortoiseServiceProvider = TortoiseServiceProvider;

