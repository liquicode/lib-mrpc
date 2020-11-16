'use strict';


const LIB_SERVICE_PROVIDER = require( './ServiceProvider' );


function ImmediateServiceProvider( ServiceName, Options )
{

	//---------------------------------------------------------------------
	let service = LIB_SERVICE_PROVIDER.ServiceProvider( ServiceName, Options );


	//---------------------------------------------------------------------
	service.DefaultOptions = () => { return {}; };


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
					// Register the endpoint.
					let endpoint = service.EndpointManager.AddEndpoint( EndpointName, CommandFunction );
					// Complete the function.
					resolve( true );
					return;
				} );
		};


	//---------------------------------------------------------------------
	service.CallEndpoint =
		async function ( EndpointName, CommandParameters, CommandCallback = null ) 
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
					// Invoke the endpoint.
					try
					{
						let reply = await service.EndpointManager.HandleEndpoint( EndpointName, CommandParameters );
						if ( CommandCallback ) { CommandCallback( null, reply ); }
						// Complete the function.
						resolve( reply );
						return;
					}
					catch ( error )
					{
						if ( CommandCallback ) { CommandCallback( error, null ); }
						// Complete the function.
						reject( error );
						return;
					}
				} );
		};


	//---------------------------------------------------------------------
	return service;
};


exports.ImmediateServiceProvider = ImmediateServiceProvider;
