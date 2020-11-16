'use strict';

const LIB_SERVICE_PROVIDER = require( './ServiceProvider' );
const LIB_AMQPLIB = require( 'amqplib' );
const LIB_UNIQID = require( 'uniqid' );

/*
let Options =
{
	server: 'amqp://localhost',
	connect_options:
	{
		connectRetries: 30,
		connectRetryInterval: 1000,
	},
};
*/

var COMMAND_CHANNEL_OPTIONS =
{
	exclusive: false,
	durable: false,
	autoDelete: true,
};

var REPLY_CHANNEL_OPTIONS =
{
	exclusive: false,
	durable: false,
	autoDelete: true,
};

function AmqpLibServiceProvider( ServiceName, Options )
{

	//---------------------------------------------------------------------
	let service = LIB_SERVICE_PROVIDER.ServiceProvider( ServiceName, Options );


	//---------------------------------------------------------------------
	service.QueueClient = null;
	service.QueueChannel = null;


	//---------------------------------------------------------------------
	service.OpenPort =
		async () => 
		{
			let result_ok = null;
			service.QueueClient = await LIB_AMQPLIB.connect( service.Options.server, service.Options.connect_options );
			service.QueueChannel = await service.QueueClient.createChannel();
			result_ok = await service.QueueChannel.prefetch( 1 );
			service.IsPortOpen = true;
			return;
		};


	//---------------------------------------------------------------------
	service.ClosePort =
		async () => 
		{
			//NOTE: Due to some unexpected behavior in AmqpLib's shutdown process,
			//		we do some sleeping to let everything settle before shutting down.
			await service.Sleep( 1000 );
			if ( service.QueueChannel )
			{
				// service.QueueChannel.on( 'error', ( error ) => console.error( 'AmqpLib ERROR: ' + error.message, error ) );
				// let endpoints = service.EndpointManager.Endpoints;
				// for ( let index = 0; index < endpoints.length; index++ )
				// {
				// 	let endpoint = endpoints[ index ];
				// 	let queue_name = `${service.ServiceName}/${endpoint.EndpointName}`;
				// 	await service.QueueChannel.deleteQueue( queue_name );
				// }
				// try
				// {
				// 	await service.QueueChannel.close()
				// 		.catch( ( error ) =>
				// 		{
				// 			console.error( 'AmqpLib ERROR: ' + error.message, error );
				// 		} );
				// }
				// catch ( error )
				// {
				// 	console.error( 'AmqpLib ERROR: ' + error.message, error );
				// }
				await service.QueueChannel.close();
				service.QueueChannel = null;
			}
			if ( service.QueueClient )
			{
				// try
				// {
				// 	await service.QueueClient.close()
				// 		.catch( ( error ) =>
				// 		{
				// 			console.error( 'AmqpLib ERROR: ' + error.message, error );
				// 		} );
				// }
				// catch ( error )
				// {
				// 	console.error( 'AmqpLib ERROR: ' + error.message, error );
				// }
				await service.QueueClient.close();
				service.QueueClient = null;
			}
			service.IsPortOpen = false;
			return;
		};


	//---------------------------------------------------------------------
	service.AddEndpoint =
		async ( EndpointName, CommandFunction ) =>
		{
			let result_ok = null;
			// Make sure this endpoint doesn't already exist.
			if ( service.EndpointManager.EndpointExists( EndpointName ) )
			{
				throw new Error( `The endpoint [${EndpointName}] already exists within [${service.ServiceName}].` );
			}
			// Subscribe to the message queue.
			// let This = this;
			let queue_name = `${service.ServiceName}/${EndpointName}`;
			result_ok = await service.QueueChannel.assertQueue( queue_name, COMMAND_CHANNEL_OPTIONS );
			result_ok = await service.QueueChannel.consume(
				queue_name,
				async function ( message )
				{
					if ( !message )
					{
						// console.warn( `An empty message was delivered on the command channel.` );
						return;
					}
					try
					{
						let message_string = message.content.toString();
						// console.debug( `Command: ${message_string}` );
						let reply = JSON.parse( message_string );
						let reply_id = reply.CommandCallback;
						let result = await service.EndpointManager.HandleEndpoint( reply.EndpointName, reply.CommandParameters );
						if ( reply_id )
						{
							let reply_queue_name = queue_name + `/${reply_id}`;
							result_ok = service.QueueChannel.assertQueue( reply_queue_name, REPLY_CHANNEL_OPTIONS );
							result_ok = service.QueueChannel.sendToQueue(
								reply_queue_name,
								Buffer.from( JSON.stringify( result ) ),
								{
									contentType: "text/plain",
									// deliveryMode: 1,
									persistent: false,
								},
							);
						}
						service.QueueChannel.ack( message );
					}
					catch ( error )
					{
						console.error( Error.message, error );
						service.QueueChannel.nack( message, false, false );
					}
					finally
					{
					}
				} );
			// Register the endpoint.
			let endpoint = service.EndpointManager.AddEndpoint( EndpointName, CommandFunction );
			// Return, OK.
			return;
		};


	//---------------------------------------------------------------------
	service.CallEndpoint =
		async ( EndpointName, CommandParameters, CommandCallback = null ) =>
		{
			let result_ok = null;
			// Validate that the endpoint exists.
			if ( !service.EndpointManager.EndpointExists( EndpointName ) )
			{
				throw new Error( `The endpoint [${EndpointName}] does not exist within [${service.ServiceName}].` );
			}
			// Setup the reply channel
			let reply_id = null;
			if ( CommandCallback )
			{
				reply_id = LIB_UNIQID();
				// let This = this;
				let result_ok = null;
				let reply_queue_name = `${service.ServiceName}/${EndpointName}/${reply_id}`;
				result_ok = await service.QueueChannel.assertQueue( reply_queue_name, REPLY_CHANNEL_OPTIONS );
				result_ok = await service.QueueChannel.consume(
					reply_queue_name,
					function ( message )
					{
						if ( !message )
						{
							// console.warn( `An empty message was delivered on the reply channel.` );
							return;
						}
						try
						{
							let message_string = message.content.toString();
							// console.debug( `Reply: ${message_string}` );
							let reply = JSON.parse( message_string );
							CommandCallback( null, reply );
						}
						catch ( error )
						{
							console.error( Error.message, error );
							CommandCallback( error, null );
						}
						finally
						{
							// result_ok = await service.QueueChannel.deleteQueue( reply_queue_name );
							service.QueueChannel.deleteQueue( reply_queue_name );
						}
					},
					{ noAck: true }
				);
			}
			// Build the message.
			let message =
			{
				EndpointName: EndpointName,
				CommandParameters: CommandParameters,
				CommandCallback: reply_id,
			};
			// Queue the message.
			let queue_name = `${service.ServiceName}/${EndpointName}`;
			result_ok = await service.QueueChannel.assertQueue( queue_name, COMMAND_CHANNEL_OPTIONS );
			result_ok = service.QueueChannel.sendToQueue(
				queue_name,
				Buffer.from( JSON.stringify( message ) ),
				{
					contentType: "text/plain",
					// deliveryMode: 1,
					persistent: false,
				},
			);
			// Return, OK.
			return;
		};


	return service;
};

exports.AmqpLibServiceProvider = AmqpLibServiceProvider;
