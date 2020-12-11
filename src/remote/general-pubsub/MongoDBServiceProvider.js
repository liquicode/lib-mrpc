'use strict';


const LIB_SERVICE_PROVIDER = require( '../../ServiceProvider' );

var LIB_MONGODB = null;
try
{
	LIB_MONGODB = require( 'mongodb' );
}
catch ( error ) 
{
	console.error( 'LIB-MRPC: An npm library required for this service provider [MongoDBServiceProvider] was not found.' );
	console.error( 'LIB-MRPC: The npm library [mongodb] was not found.' );
	console.error( 'LIB-MRPC: To install [mongodb] please use: npm install --save mongodb' );
	throw error;
}


function MongoDBServiceProvider( ServiceName, Options )
{

	//---------------------------------------------------------------------
	let service = LIB_SERVICE_PROVIDER.ServiceProvider( ServiceName, Options );


	//---------------------------------------------------------------------
	service.MongoClient = null;
	service.MongoDatabase = null;
	service.MongoCollection = null;
	service.MongoCursor = null;


	//---------------------------------------------------------------------
	service.DefaultOptions =
		() =>
		{
			return {
				enable_service: false,
				url: 'mongodb://localhost:27017',
				options:
				{
					useUnifiedTopology: true,
					useNewUrlParser: true,
				},
				database_name: '',
				collection_name: '',
				collection_size: 10 * ( 1024 * 1024 ),
			};
		};


	//---------------------------------------------------------------------
	async function create_capped_collection( Database, Name, Options )
	{
		let collections = await Database.collections();
		let collection = collections.find( collection => collection.collectionName === Name );
		if ( collection )
		{
			// If collection exists but is not capped, throw an error.
			let is_capped = await collection.isCapped();
			if ( !is_capped )
			{
				throw new Error( `Collection [${Name}] already exists but is not a capped collection.` );
				// Database.dropCollection( Name );
				// collection = null;
			}
		}
		if ( !collection )
		{
			// Create a capped colleciton.
			collection = await Database.createCollection(
				Name,
				{
					capped: true,
					size: Options.collection_size
				} );
			// Insert a 'starter' document.
			await collection.insertOne( { collection: 'Initialized' } );
		}
		// Return the collection.
		return collection;
	}


	//---------------------------------------------------------------------
	async function create_tailable_cursor( Collection, Criteria, Callback )
	{
		let cursor = Collection.find(
			Criteria,
			{
				tailable: true,
				awaitData: true,
				timeout: false,
				sortValue: { $natural: -1 },
				numberOfRetries: Number.MAX_VALUE,
				tailableRetryInterval: 500,
			} );
		cursor.each(
			async ( err, document ) =>
			{
				Callback( err, document );
			} );
		return cursor;
	}


	//---------------------------------------------------------------------
	service.OpenPort =
		async () =>
		{
			return new Promise(
				async ( resolve, reject ) => 
				{
					// Make a connection to the mongodb server.
					service.MongoClient = await LIB_MONGODB.MongoClient.connect( service.Options.url, service.Options.options );
					// Make sure we have the intended database according to the Options.
					service.Options.database_name = service.Options.database_name || service.ServiceName;
					service.MongoDatabase = await service.MongoClient.db( service.Options.database_name );
					if ( service.Options.enable_service )
					{
						// Create the capped collection for this service.
						service.MongoCollection = await create_capped_collection( service.MongoDatabase, service.ServiceName, service.Options );
						// Create a tailable cursor to respond to service requests.
						service.MongoCursor = await create_tailable_cursor(
							service.MongoCollection,
							{
								command_state: 1,
							},
							async ( err, document ) =>
							{
								try
								{
									if ( err ) { throw err; }
									let response =
									{
										reply_state: 1,
										ReplyID: document.ReplyID,
										EndpointResult: null,
										EndpointError: null,
									};
									try
									{
										response.EndpointResult = await service.EndpointManager.HandleEndpoint( document.EndpointName, document.CommandParameters );
									}
									catch ( error ) 
									{
										response.EndpointError = error.message;
									}
									if ( response.ReplyID )
									{
										service.MongoCollection.insertOne( response );
									}
								}
								catch ( error )
								{
									if (
										( error.name === 'MongoError' )
										&& ( error.codeName === 'CursorKilled' )
									) { return; }
									console.error( error.message, error );
								}
								finally
								{
								}
								return;
							} );
					};
					// Complete the function.
					service.IsPortOpen = true;
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
					if ( service.MongoCursor )
					{
						await service.MongoCursor.close();
						service.MongoCursor = null;
					}
					if ( service.MongoCollection )
					{
						await service.MongoCollection.drop();
						service.MongoCollection = null;
					}
					if ( service.MongoDatabase )
					{
						// await service.MongoDatabase.close();
						service.MongoDatabase = null;
					}
					if ( service.MongoClient )
					{
						await service.MongoClient.close();
						service.MongoClient = null;
					}
					// Complete the function.
					service.IsPortOpen = false;
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
					// Make sure we have enabled service.
					if ( !service.Options.enable_service )
					{
						reject( new Error( `You must set [enable_service = true] within the service provider options to allow adding endpoints.` ) );
						return;
					}
					// Make sure this endpoint doesn't already exist.
					if ( service.EndpointManager.EndpointExists( EndpointName ) )
					{
						reject( new Error( `The endpoint [${EndpointName}] already exists within [${service.ServiceName}].` ) );
						return;
					}
					// Register the endpoint.
					let endpoint = service.EndpointManager.AddEndpoint( EndpointName, CommandFunction );
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

					// Get the collection used for service messages.
					let collection = await create_capped_collection( service.MongoDatabase, service.ServiceName, service.Options );
					// Create a tailable cursor to respond to service replies.
					let cursor = await create_tailable_cursor(
						service.MongoCollection,
						{
							reply_state: 1,
							ReplyID: reply_id,
						},
						async ( err, document ) =>
						{
							try
							{
								if ( err ) { throw err; }
								if ( document.EndpointError )
								{
									let error = new Error( document.EndpointError );
									if ( CommandCallback ) { CommandCallback( error, null ); }
									reject( error );
								}
								else
								{
									if ( CommandCallback ) { CommandCallback( null, document.EndpointResult ); }
									resolve( document.EndpointResult );
								}
							}
							catch ( error )
							{
								// if ( CommandCallback ) { CommandCallback( error, null ); }
								reject( error );
							}
							finally
							{
								await cursor.close();
							}
							return;
						}
					);
					// Queue the command.
					await collection.insertOne(
						{
							command_state: 1,
							EndpointName: EndpointName,
							CommandParameters: CommandParameters,
							ReplyID: reply_id,
						} );
					// Return, OK.
					return;
				} );
		};


	//---------------------------------------------------------------------
	service.Options = service.ApplyDefaultOptions( Options );
	return service;
}


exports.MongoDBServiceProvider = MongoDBServiceProvider;

