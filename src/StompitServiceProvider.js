'use strict';


const LIB_SERVICE_PROVIDER = require( './ServiceProvider' );

var LIB_STOMPIT = null;
try
{
	LIB_STOMPIT = require( 'stompit' );
}
catch ( error ) 
{
	console.error( 'The npm library [stompit] was not found.' );
	console.error( 'To install [stompit] please use: npm install --save stompit' );
	throw error;
}


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


function StompitServiceProvider( ServiceName, Options )
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
				host: 'localhost',
				port: 61613,
				timeout: 3000,
				// path: null,
				// ssl: false,
				connectHeaders:
				{
					host: 'localhost',
					login: 'guest',
					passcode: 'guest',
					'accept-version': '1.0,1.1,1.2',
					'heart-beat': '5000,5000',
				},
			};
		};



	// //---------------------------------------------------------------------
	// process_next_message:
	// 	async function process_next_message()
	// 	{
	// 		if ( !service.Messages.length ) { return; }
	// 		// Dequeue the next message.
	// 		let message = service.Messages[ 0 ];
	// 		service.Messages = service.Messages.slice( 1 );
	// 		// Invoke the endpoint.
	// 		try
	// 		{
	// 			let result = await service.Endpoints[ message.EndpointName ].Handler( message.CommandParameters );
	// 			message.CommandCallback( null, result );
	// 		}
	// 		catch ( error )
	// 		{
	// 			message.CommandCallback( error, null );
	// 		}
	// 		return;
	// 	},


	//---------------------------------------------------------------------
	service.OpenPort =
		async () =>
		{
			return new Promise(
				async ( resolve, reject ) => 
				{
					// resolve( true );
					LIB_STOMPIT.connect(
						service.Options,
						( error, client ) =>
						{
							if ( error )
							{
								console.error( 'StompitServiceProvider: connect error ' + error.message );
								reject( error );
								return;
							}
							service.QueueClient = client;
							service.IsPortOpen = true;
							resolve( true );
						} );
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
						//TODO: await endpoint.Channel.disconnect();
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
					// Make sure this endpoint doesn't already exist.
					if ( service.EndpointManager.EndpointExists( EndpointName ) )
					{
						reject( new Error( `The endpoint [${EndpointName}] already exists within [${service.ServiceName}].` ) );
						return;
					}
					// Subscribe to the message queue.
					let queue_name = `/queue/${service.ServiceName}/${EndpointName}`;
					let channel = service.QueueClient.subscribe(
						{
							destination: queue_name,
							ack: 'client-individual'
						},
						async function ( error, message )
						{
							if ( error )
							{
								if ( message ) { message.nack( error ); }
								throw new Error( `Queue subscription Error: ${error.message}` );
							}
							// message.readString(
							// 	'utf-8',
							// 	function ( error, body )
							// 	{
							// 		if ( error ) { throw new Error( `Queue message read Error: ${error.message}` ); }
							// 		console.log( 'received message: ' + body );
							// 		try
							// 		{
							// 			CommandFunction( body );
							// 		}
							// 		catch ( error )
							// 		{
							// 			console.error( Error.message, error );
							// 			message.nack( error );
							// 		}
							// 		finally
							// 		{
							// 		}
							// 		message.ack();
							// 	} );
							let message_string = await message.readString( 'utf-8' );
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
								const sendHeaders = {
									destination: reply_queue_name,
									'content-type': 'text/plain'
								};
								let frame = service.QueueClient.send( sendHeaders );
								frame.write( JSON.stringify( response ) );
								frame.end();
							}
							message.ack();
							return;
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
		async function CallEndpoint( EndpointName, CommandParameters, CommandCallback ) 
		{
			// Validate that the endpoint exists.
			if ( !service.EndpointManager.EndpointExists( EndpointName ) )
			{
				throw new Error( `The endpoint [${EndpointName}] does not exist within [${service.ServiceName}].` );
			}
			// Setup the reply channel
			let reply_id = service.UniqueID();
			let reply_queue_name = `/queue/${service.ServiceName}/${EndpointName}/${reply_id}`;
			let reply_channel = service.QueueClient.subscribe(
				{
					destination: reply_queue_name,
					ack: 'client-individual'
				},
				async function ( error, message )
				{
					if ( error ) { throw new Error( `Queue reply subscription Error: ${error.message}` ); }
					try
					{
						let message_string = message.readString( 'utf-8' );
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
					message.ack();
				} );
			// Build the message.
			let message =
			{
				EndpointName: EndpointName,
				CommandParameters: CommandParameters,
				CommandCallback: reply_id,
			};
			// Queue the message.
			const sendHeaders = {
				destination: `/queue/${service.ServiceName}/${EndpointName}`,
				'content-type': 'text/plain'
			};
			const frame = service.QueueClient.send( sendHeaders );
			frame.write( JSON.stringify( message ) );
			frame.end();
			// Return, OK.
			return;
		};


	//---------------------------------------------------------------------
	service.Options = service.ApplyDefaultOptions( Options );
	return service;
};


exports.StompitServiceProvider = StompitServiceProvider;

