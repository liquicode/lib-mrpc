'use strict';


const LIB_SERVICE_PROVIDER = require( './ServiceProvider' );
const LIB_AMQPLIB = require( 'amqplib' );
const LIB_UNIQID = require( 'uniqid' );


function AmqpLibServiceProvider( ServiceName, Options )
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
					service.QueueClient = await LIB_AMQPLIB.connect(
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
						await service.QueueClient.close();
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
					let result_ok = null;
					// Make sure this endpoint doesn't already exist.
					if ( service.EndpointManager.EndpointExists( EndpointName ) )
					{
						reject( new Error( `The endpoint [${EndpointName}] already exists within [${service.ServiceName}].` ) );
						return;
					}
					// Subscribe to the message queue.
					// let This = this;
					let queue_name = `${service.ServiceName}/${EndpointName}`;
					let channel = await service.QueueClient.createChannel();
					result_ok = await channel.prefetch( 1 );
					result_ok = await channel.assertQueue( queue_name, service.Options.command_queue_options );
					result_ok = await channel.consume(
						queue_name,
						async function ( message )
						{
							if ( !message ) { return; }
							try
							{
								let message_string = message.content.toString();
								let request = JSON.parse( message_string );
								let response =
								{
									ReplyID: request.ReplyID,
									EndpointResult: null,
									EndpointError: null,
								};
								try
								{
									response.EndpointResult = await service.EndpointManager.HandleEndpoint( request.EndpointName, request.CommandParameters );
								}
								catch ( error ) 
								{
									response.EndpointError = error.message;
								}
								if ( response.ReplyID )
								{
									let reply_queue_name = queue_name + `/${response.ReplyID}`;
									let reply_channel = await service.QueueClient.createChannel();
									result_ok = await reply_channel.assertQueue( reply_queue_name, service.Options.reply_queue_options );
									result_ok = reply_channel.sendToQueue(
										reply_queue_name,
										Buffer.from( JSON.stringify( response ) ),
										{
											contentType: "text/plain",
											// deliveryMode: 1,
											persistent: false,
										},
									);
								}
								channel.ack( message );
							}
							catch ( error )
							{
								console.error( Error.message, error );
								channel.nack( message, false, false );
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
		async ( EndpointName, CommandParameters, CommandCallback = null ) =>
		{
			return new Promise(
				async ( resolve, reject ) => 
				{
					let result_ok = null;
					// Validate that the endpoint exists.
					if ( !service.EndpointManager.EndpointExists( EndpointName ) )
					{
						throw new Error( `The endpoint [${EndpointName}] does not exist within [${service.ServiceName}].` );
					}
					// Setup the reply channel
					let reply_id = LIB_UNIQID();
					let reply_queue_name = `${service.ServiceName}/${EndpointName}/${reply_id}`;
					let reply_channel = await service.QueueClient.createChannel();
					await reply_channel.assertQueue( reply_queue_name, service.Options.reply_queue_options );
					await reply_channel.consume(
						reply_queue_name,
						function ( message )
						{
							if ( !message ) { return; }
							try
							{
								let message_string = message.content.toString();
								let response = JSON.parse( message_string );
								if ( response.EndpointError )
								{
									let error = new Error( response.EndpointError );
									if ( CommandCallback ) { CommandCallback( error, null ); }
									reject( error );
								}
								else
								{
									if ( CommandCallback ) { CommandCallback( null, response.EndpointResult ); }
									resolve( response.EndpointResult );
								}
							}
							catch ( error )
							{
								if ( CommandCallback ) { CommandCallback( error, null ); }
								reject( error );
							}
							finally
							{
								reply_channel.close();
							}
						},
						{ noAck: true }
					);
					// Build the message.
					let message =
					{
						EndpointName: EndpointName,
						CommandParameters: CommandParameters,
						ReplyID: reply_id,
					};
					// Queue the message.
					let queue_name = `${service.ServiceName}/${EndpointName}`;
					let channel = await service.QueueClient.createChannel();
					await channel.assertQueue( queue_name, service.Options.command_queue_options );
					await channel.sendToQueue(
						queue_name,
						Buffer.from( JSON.stringify( message ) ),
						{
							contentType: "text/plain",
							// deliveryMode: 1,
							persistent: false,
						},
					);
					await channel.close();
				} );
		};


	//---------------------------------------------------------------------
	service.Options = service.ApplyDefaultOptions( Options );
	return service;
};

exports.AmqpLibServiceProvider = AmqpLibServiceProvider;
