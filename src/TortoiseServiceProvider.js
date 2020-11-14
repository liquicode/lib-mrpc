'use strict';


const LIB_TORTOISE = require( 'tortoise' );
const LIB_UNIQID = require( 'uniqid' );


/*
let Options =
{
	server: 'localhost',
	connect_options:
	{
		connectRetries: 30,
		connectRetryInterval: 1000,
	},
};
*/


exports.TortoiseServiceProvider =
	function TortoiseServiceProvider( ServiceName, Options )
	{
		return {


			//---------------------------------------------------------------------
			ServiceName: ServiceName,
			Options: Options,
			Endpoints: {},
			QueueClient: null,
			Messages: [],


			//---------------------------------------------------------------------
			IsPortOpen: false,


			//---------------------------------------------------------------------
			// A service opens a port to listen for connections.
			OpenPort:
				async function OpenPort()
				{
					this.QueueClient = new LIB_TORTOISE(
						this.Options.server,
						this.Options.connect_options );
					this.IsPortOpen = true;
					return;
				},


			//---------------------------------------------------------------------
			// A service can close its port to stop listening for connections.
			ClosePort:
				async function ClosePort()
				{
					// this.QueueClient.close();
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
					if ( typeof this.Endpoints[ EndpointName ] !== 'undefined' )
					{
						throw new Error( `The endpoint [${EndpointName}] already exists within [${this.ServiceName}].` );
					}
					// Subscribe to the message queue.
					let This = this;
					let channel = await this.QueueClient
						.queue( `/queue/${this.ServiceName}/${EndpointName}`, { durable: true } )
						.prefetch( 1 )
						.subscribe(
							async function ( message, ack, nack )
							{
								try
								{
									let request = JSON.parse( message );
									let reply_id = request.ReplyCallback;
									let result = CommandFunction( request.CommandParameters );
									if ( reply_id )
									{
										await This.QueueClient
											.queue( `/queue/${This.ServiceName}/${EndpointName}/${reply_id}`, { durable: true } )
											.publish( result );
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
					this.Endpoints[ EndpointName ] =
					{
						EndpointName: EndpointName,
						Handler: CommandFunction,
						Channel: channel,
					};
					// Return, OK.
					return;
				},


			//---------------------------------------------------------------------
			DestroyEndpoint:
				async function DestroyEndpoint( EndpointName ) 
				{
					if ( typeof this.Endpoints[ EndpointName ] === 'undefined' ) { return; }
					// Disconnect the subscription.
					this.Endpoints[ EndpointName ].Subscription.unsubscribe();
					// Deregister the endpoint.
					delete this.Endpoints[ EndpointName ];
					// Remove any messages destined for this endpoint.

					//TODO:

					// Return, OK.
					return;
				},


			//---------------------------------------------------------------------
			CallEndpoint:
				async function CallEndpoint( EndpointName, CommandParameters, ReplyCallback ) 
				{
					// Validate that the endpoint exists.
					if ( typeof this.Endpoints[ EndpointName ] === 'undefined' )
					{
						throw new Error( `The endpoint [${EndpointName}] does not exist within [${this.ServiceName}].` );
					}
					// Setup the reply channel
					let reply_id = LIB_UNIQID();
					let channel = await this.QueueClient
						.queue( `/queue/${this.ServiceName}/${EndpointName}/${reply_id}`, { durable: true } )
						.prefetch( 1 )
						.subscribe(
							async function ( message, ack, nack )
							{
								try
								{
									let request = JSON.parse( message );
									ReplyCallback( null, request );
									ack();
								}
								catch ( error )
								{
									nack( false );
									ReplyCallback( error, null );
								}
								finally
								{
									await channel.close();
								}
							} );
					// Build the message.
					let message =
					{
						EndpointName: EndpointName,
						CommandParameters: CommandParameters,
						ReplyCallback: reply_id,
					};
					// Queue the message.
					await this.QueueClient
						.queue( `/queue/${this.ServiceName}/${EndpointName}`, { durable: true } )
						.publish( message )
						;
					// Return, OK.
					return;
				},

		};
		return;
	};


