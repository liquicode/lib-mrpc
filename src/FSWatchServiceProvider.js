'use strict';


const LIB_SERVICE_PROVIDER = require( './ServiceProvider' );
const LIB_OS = require( 'os' );
const LIB_FS = require( 'fs' );
const LIB_PATH = require( 'path' );
const LIB_UNIQID = require( 'uniqid' );


function FSWatchServiceProvider( ServiceName, Options )
{

	//---------------------------------------------------------------------
	let service = LIB_SERVICE_PROVIDER.ServiceProvider( ServiceName, Options );


	//---------------------------------------------------------------------
	let FSWatcher = null;


	//---------------------------------------------------------------------
	service.DefaultOptions =
		() =>
		{
			return {
				path: LIB_OS.tmpdir(),
			};
		};


	//---------------------------------------------------------------------
	service.OpenPort =
		async () =>
		{
			return new Promise(
				async ( resolve, reject ) => 
				{
					// Initiate a file watcher for command files.
					let command_path = LIB_PATH.resolve( service.Options.path );
					command_path = LIB_PATH.join( command_path, service.ServiceName );
					if ( !LIB_FS.existsSync( command_path ) )
					{
						LIB_FS.mkdirSync( command_path, { recursive: true } );
					}
					service.FSWatcher = LIB_FS.watch(
						command_path,
						{
							persistent: true,
							recursive: false,
							encoding: 'utf8'
						},
						async ( event, filename ) =>
						{
							if ( !filename ) { return; }
							if ( !filename.endsWith( '.cmd' ) ) { return; }
							if ( event === 'rename' )
							{
								filename = LIB_PATH.join( command_path, filename );
								if ( !LIB_FS.existsSync( filename ) ) { return; }
								try
								{
									let message = LIB_FS.readFileSync( filename );
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
										let reply_filename = LIB_PATH.join( command_path, response.ReplyID + '.reply' );
										LIB_FS.writeFileSync( reply_filename, JSON.stringify( response ) );
									}
								}
								catch ( error )
								{
									console.error( Error.message, error );
								}
								finally
								{
									LIB_FS.unlinkSync( filename );
								}
							}
							return;
						} );
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
					// Shutdown the command watcher.
					service.FSWatcher.close();
					service.FSWatcher = null;
					// Remove the folder.
					let command_path = LIB_PATH.resolve( service.Options.path );
					command_path = LIB_PATH.join( command_path, service.ServiceName );
					if ( LIB_FS.existsSync( command_path ) )
					{
						LIB_FS.rmdirSync( command_path, { recursive: true, maxRetries: 10, retryDelay: 100 } );
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
					// Validate that the endpoint exists.
					if ( !service.EndpointManager.EndpointExists( EndpointName ) )
					{
						reject( new Error( `The endpoint [${EndpointName}] does not exist within [${service.ServiceName}].` ) );
						return;
					}
					// Initiate a file watcher for reply files.
					let command_path = LIB_PATH.resolve( service.Options.path );
					command_path = LIB_PATH.join( command_path, service.ServiceName );
					if ( !LIB_FS.existsSync( command_path ) )
					{
						LIB_FS.mkdirSync( command_path, { recursive: true } );
					}
					// Initiate a file watcher for reply files.
					let reply_id = LIB_UNIQID();
					let reply_filename = reply_id + '.reply';
					let reply_watcher = LIB_FS.watch(
						command_path,
						{
							persistent: true,
							recursive: false,
							encoding: 'utf8'
						},
						async ( event, filename ) =>
						{
							if ( !filename ) { return; }
							if ( filename !== reply_filename ) { return; }
							if ( event === 'rename' )
							{
								filename = LIB_PATH.join( command_path, filename );
								if ( !LIB_FS.existsSync( filename ) ) { return; }
								try
								{
									let message = LIB_FS.readFileSync( filename );
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
									reply_watcher.close();
									LIB_FS.unlinkSync( filename );
								}
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
					// Create a command file.
					let command_id = LIB_UNIQID();
					let command_filename = LIB_PATH.join( command_path, command_id + '.cmd' );
					LIB_FS.writeFileSync( command_filename, JSON.stringify( message ) );
				} );
		};


	//---------------------------------------------------------------------
	service.Options = service.ApplyDefaultOptions( Options );
	return service;
};


exports.FSWatchServiceProvider = FSWatchServiceProvider;

