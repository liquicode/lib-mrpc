'use strict';


const LIB_STOMPIT = require( 'stompit' );
const LIB_UNIQID = require( 'uniqid' );


/*
let Options =
{
	host: 'localhost',
	port: 61613,
	connectHeaders:
	{
		host: '/',
		login: 'username',
		passcode: 'password',
		'heart-beat': '5000,5000',
	}
};
*/


exports.StompServiceProvider =
	function StompServiceProvider( ServiceName, Options )
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


			// //---------------------------------------------------------------------
			// process_next_message:
			// 	async function process_next_message()
			// 	{
			// 		if ( !this.Messages.length ) { return; }
			// 		// Dequeue the next message.
			// 		let message = this.Messages[ 0 ];
			// 		this.Messages = this.Messages.slice( 1 );
			// 		// Invoke the endpoint.
			// 		try
			// 		{
			// 			let result = await this.Endpoints[ message.EndpointName ].Handler( message.CommandParameters );
			// 			message.ReplyCallback( null, result );
			// 		}
			// 		catch ( error )
			// 		{
			// 			message.ReplyCallback( error, null );
			// 		}
			// 		return;
			// 	},


			//---------------------------------------------------------------------
			// A service opens a port to listen for connections.
			OpenPort:
				async function OpenPort()
				{
					this.QueueClient = await LIB_STOMPIT.connect( this.Options );
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
					let subscription = this.QueueClient.subscribe(
						{
							destination: `/queue/${this.ServiceName}/${EndpointName}`,
							ack: 'client-individual'
						},
						function ( error, message )
						{
							if ( error ) { throw new Error( `Queue subscription Error: ${error.message}` ); }
							message.readString(
								'utf-8',
								function ( error, body )
								{
									if ( error ) { throw new Error( `Queue message read Error: ${error.message}` ); }
									console.log( 'received message: ' + body );
									try
									{
										CommandFunction( body );
										message.ack();
										// this.Client.ack( message );
									}
									catch ( error )
									{
										// this.Client.nack( error );
										message.nack( error );
									}
									finally
									{
									}
								} );
						} );
					// Register the endpoint.
					this.Endpoints[ EndpointName ] =
					{
						EndpointName: EndpointName,
						Handler: CommandFunction,
						Subscription: subscription,
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
					let subscription = this.QueueClient.subscribe(
						{
							destination: `/queue/${this.ServiceName}/${EndpointName}/${reply_id}`,
							ack: 'client-individual'
						},
						function ( error, message )
						{
							if ( error ) { throw new Error( `Queue reply subscription Error: ${error.message}` ); }
							message.readString(
								'utf-8',
								function ( error, body )
								{
									if ( error ) { throw new Error( `Queue reply message read Error: ${error.message}` ); }
									console.log( 'received reply message: ' + body );
									ReplyCallback( null, body );
									message.ack();
								} );
						} );
					// Build the message.
					let message =
					{
						EndpointName: EndpointName,
						CommandParameters: CommandParameters,
						ReplyCallback: reply_id,
					};
					// Queue the message.
					const sendHeaders = {
						destination: `/queue/${this.ServiceName}/${EndpointName}`,
						'content-type': 'text/plain'
					};
					const frame = this.QueueClient.send( sendHeaders );
					frame.write( JSON.stringify( message ) );
					frame.end();
					// Return, OK.
					return;
				},

		};
		return;
	};


