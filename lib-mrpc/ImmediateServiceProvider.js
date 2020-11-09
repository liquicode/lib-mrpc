'use strict';


const LIB_ENDPOINTS_MANAGER = require( './EndpointsManager.js' );


/*
let Options =
{
};
*/


exports.ImmediateServiceProvider =
	function ImmediateServiceProvider( ServiceName, Options )
	{
		return {


			//---------------------------------------------------------------------
			ServiceName: ServiceName,
			Options: Options,
			Endpoints: LIB_ENDPOINTS_MANAGER.NewEndpoints(),
			IsPortOpen: false,


			//---------------------------------------------------------------------
			// A service opens a port to listen for connections.
			OpenPort:
				async function OpenPort()
				{
					this.IsPortOpen = true;
					return;
				},


			//---------------------------------------------------------------------
			// A service can close its port to stop listening for connections.
			ClosePort:
				async function ClosePort()
				{
					this.IsPortOpen = false;
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
						return;
					}
					// Invoke the endpoint.
					try
					{
						// let result = await this.Endpoints[ EndpointName ].Handler( CommandParameters );
						let result = await this.Endpoints.HandleEndpoint( EndpointName, CommandParameters );
						if ( ReplyCallback ) { ReplyCallback( null, result ); }
					}
					catch ( error )
					{
						if ( ReplyCallback ) { ReplyCallback( error, null ); }
					}
					// Return, OK.
					return;
				},

		};
		return;
	};


