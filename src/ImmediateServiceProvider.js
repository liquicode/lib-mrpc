'use strict';

const LIB_SERVICE_PROVIDER = require( './ServiceProvider' );


function ImmediateServiceProvider( ServiceName, Options )
{

	//---------------------------------------------------------------------
	let service = LIB_SERVICE_PROVIDER.ServiceProvider( ServiceName, Options );


	//---------------------------------------------------------------------
	service.OpenPort =
		async () => { service.IsPortOpen = true; };


	//---------------------------------------------------------------------
	service.ClosePort =
		async () => { service.IsPortOpen = false; };


	//---------------------------------------------------------------------
	service.AddEndpoint =
		async ( EndpointName, CommandFunction ) => 
		{
			// Make sure this endpoint doesn't already exist.
			if ( service.EndpointManager.EndpointExists( EndpointName ) )
			{
				throw new Error( `The endpoint [${EndpointName}] already exists within [${service.ServiceName}].` );
			}
			// Register the endpoint.
			let endpoint = service.EndpointManager.AddEndpoint( EndpointName, CommandFunction );
			// Return, OK.
			return;
		};


	//---------------------------------------------------------------------
	service.CallEndpoint =
		async function ( EndpointName, CommandParameters, ReplyCallback = null ) 
		{
			// Validate that the endpoint exists.
			if ( !service.EndpointManager.EndpointExists( EndpointName ) )
			{
				throw new Error( `The endpoint [${EndpointName}] does not exist within [${service.ServiceName}].` );
				return;
			}
			// Invoke the endpoint.
			try
			{
				// let result = await this.Endpoints[ EndpointName ].Handler( CommandParameters );
				let result = await service.EndpointManager.HandleEndpoint( EndpointName, CommandParameters );
				if ( ReplyCallback ) { ReplyCallback( null, result ); }
			}
			catch ( error )
			{
				if ( ReplyCallback ) { ReplyCallback( error, null ); }
			}
			// Return, OK.
			return;
		};


	//---------------------------------------------------------------------
	return service;
};


exports.ImmediateServiceProvider = ImmediateServiceProvider;
