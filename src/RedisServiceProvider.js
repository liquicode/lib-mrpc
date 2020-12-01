'use strict';


const LIB_SERVICE_PROVIDER = require( './ServiceProvider' );

var LIB_REDIS = null;
try
{
	LIB_REDIS = require( 'redis' );
}
catch ( error ) 
{
	console.error( 'LIB-MRPC: An npm library required for this service provider [RedisServiceProvider] was not found.' );
	console.error( 'LIB-MRPC: The npm library [redis] was not found.' );
	console.error( 'LIB-MRPC: To install [redis] please use: npm install --save redis' );
	throw error;
}


function RedisServiceProvider( ServiceName, Options )
{

	//---------------------------------------------------------------------
	let service = LIB_SERVICE_PROVIDER.ServiceProvider( ServiceName, Options );


	//---------------------------------------------------------------------
	service.DefaultOptions =
		() =>
		{
			return {
				host: null,
				port: null,
				path: null,
				url: 'redis://localhost:6379',
			};
		};


	//---------------------------------------------------------------------
	service.OpenPort =
		async () =>
		{
			return new Promise(
				async ( resolve, reject ) => 
				{
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
						endpoint.Channel.unsubscribe();
						endpoint.Channel.quit();
					}
					// // Disconnect.
					// if ( service.RedisClient )
					// {
					// 	await service.RedisClient.quit();
					// 	service.RedisClient = null;
					// }
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
					let queue_name = `${service.ServiceName}/${EndpointName}`;
					let channel = LIB_REDIS.createClient( service.Options );
					channel.on( 'message',
						async function ( channel, message )
						{
							try
							{
								let request = JSON.parse( message );
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
									let reply_queue_name = `${service.ServiceName}/${EndpointName}/${response.ReplyID}`;
									let reply_channel = LIB_REDIS.createClient( service.Options );
									reply_channel.publish( reply_queue_name, JSON.stringify( response ) );
									reply_channel.quit();
								}
							}
							catch ( error )
							{
								console.error( Error.message, error );
							}
							finally
							{
							}
							return;
						} );
					channel.subscribe( queue_name );
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
					// Setup the reply channel
					let reply_id = service.UniqueID();
					let reply_queue_name = `${service.ServiceName}/${EndpointName}/${reply_id}`;
					let reply_channel = LIB_REDIS.createClient( service.Options );
					reply_channel.on( 'message',
						function ( channel, message )
						{
							try
							{
								let response = JSON.parse( message );
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
								reply_channel.unsubscribe();
								reply_channel.quit();
							}
							return;
						} );
					reply_channel.subscribe( reply_queue_name );
					// Build the message.
					let message =
					{
						EndpointName: EndpointName,
						CommandParameters: CommandParameters,
						ReplyID: reply_id,
					};
					// Queue the message.
					let queue_name = `${service.ServiceName}/${EndpointName}`;
					let channel = LIB_REDIS.createClient( service.Options );
					channel.publish( queue_name, JSON.stringify( message ) );
					channel.quit();
					return;
				} );
		};


	//---------------------------------------------------------------------
	service.Options = service.ApplyDefaultOptions( Options );
	return service;
};


exports.RedisServiceProvider = RedisServiceProvider;

