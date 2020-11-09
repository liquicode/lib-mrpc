'use strict';


const LIB_AMQPLIB = require( 'amqplib' );
/*
REFS:
	https://github.com/squaremo/amqp.node
	https://www.squaremobius.net/amqp.node/channel_api.html#overview
*/

const LIB_UNIQID = require( 'uniqid' );
const LIB_ENDPOINTS_MANAGER = require( './EndpointsManager.js' );

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

exports.AmqpLibServiceProvider =
	function AmqpLibServiceProvider( ServiceName, Options )
	{
		return {


			//---------------------------------------------------------------------
			ServiceName: ServiceName,
			Options: Options,
			Endpoints: LIB_ENDPOINTS_MANAGER.NewEndpoints(),
			IsPortOpen: false,
			QueueClient: null,
			QueueChannel: null,
			Messages: [],


			//---------------------------------------------------------------------
			// A service opens a port to listen for connections.
			OpenPort:
				async function OpenPort()
				{
					let result_ok = null;
					this.QueueClient = await LIB_AMQPLIB.connect( this.Options.server );
					this.QueueChannel = await this.QueueClient.createChannel();
					result_ok = await this.QueueChannel.prefetch( 1 );
					this.IsPortOpen = true;
					return;
				},


			//---------------------------------------------------------------------
			// A service can close its port to stop listening for connections.
			ClosePort:
				async function ClosePort()
				{
					this.QueueChannel.close();
					this.QueueClient.close();
					this.IsPortOpen = false;
					let message_count = this.Messages.length;
					if ( message_count > 0 )
					{
						// throw new Error( `There are still [${message_count}] messages left in the queue.` );
						console.warn( `The port was closed but there are still [${message_count}] messages left in the queue.` );
					}
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
					// Subscribe to the message queue.
					let This = this;
					let result_ok = null;
					let queue_name = `${this.ServiceName}/${EndpointName}`;
					result_ok = await this.QueueChannel.assertQueue( queue_name, COMMAND_CHANNEL_OPTIONS );
					result_ok = await this.QueueChannel.consume(
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
								let reply_id = reply.ReplyCallback;
								let result = await This.Endpoints.HandleEndpoint( reply.EndpointName, reply.CommandParameters );
								if ( reply_id )
								{
									let reply_queue_name = queue_name + `/${reply_id}`;
									result_ok = This.QueueChannel.assertQueue( reply_queue_name, REPLY_CHANNEL_OPTIONS );
									result_ok = This.QueueChannel.sendToQueue(
										reply_queue_name,
										new Buffer( JSON.stringify( result ) ),
										{
											contentType: "text/plain",
											// deliveryMode: 1,
											persistent: false,
										},
									);
								}
								This.QueueChannel.ack( message );
							}
							catch ( error )
							{
								console.error( Error.message, error );
								This.QueueChannel.nack( message, false, false );
							}
							finally
							{
							}
						} );
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
					// Setup the reply channel
					let reply_id = null;
					if ( ReplyCallback )
					{
						reply_id = LIB_UNIQID();
						let This = this;
						let result_ok = null;
						let reply_queue_name = `${this.ServiceName}/${EndpointName}/${reply_id}`;
						result_ok = await this.QueueChannel.assertQueue( reply_queue_name, REPLY_CHANNEL_OPTIONS );
						result_ok = await this.QueueChannel.consume(
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
									ReplyCallback( null, reply );
								}
								catch ( error )
								{
									console.error( Error.message, error );
									ReplyCallback( error, null );
								}
								finally
								{
									// result_ok = await This.QueueChannel.deleteQueue( reply_queue_name );
									This.QueueChannel.deleteQueue( reply_queue_name );
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
						ReplyCallback: reply_id,
					};
					// Queue the message.
					let queue_name = `${this.ServiceName}/${EndpointName}`;
					result_ok = await this.QueueChannel.assertQueue( queue_name, COMMAND_CHANNEL_OPTIONS );
					result_ok = this.QueueChannel.sendToQueue(
						queue_name,
						new Buffer( JSON.stringify( message ) ),
						{
							contentType: "text/plain",
							// deliveryMode: 1,
							persistent: false,
						},
					);
					// Return, OK.
					return;
				},

		};
		return;
	};

