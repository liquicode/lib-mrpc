'use strict';


//---------------------------------------------------------------------
function ServiceClient()
{
	return {

		//---------------------------------------------------------------------
		Services: {},


		//---------------------------------------------------------------------
		ConnectService:
			function ConnectService( Service )
			{
				let service_name = Service.ServiceName;
				// Validate that the service does not already exist.
				if ( typeof this.Services[ service_name ] !== 'undefined' )
				{
					throw new Error( `The service [${service_name}] already exists.` );
				}
				this.Services[ service_name ] = Service;
				return;
			},


		//---------------------------------------------------------------------
		DisconnectService:
			function DisconnectService( ServiceName )
			{
				// Validate that the service does exist.
				if ( typeof this.Services[ ServiceName ] !== 'undefined' )
				{
					delete this.Services[ ServiceName ];
				}
				return;
			},


		//---------------------------------------------------------------------
		CallEndpoint:
			function CallEndpoint( ServiceName, EndpointName, CommandParameters, CommandCallback ) 
			{
				// Validate that the service exists.
				if ( typeof this.Services[ ServiceName ] === 'undefined' )
				{
					throw new Error( `The service [${ServiceName}] does not exist.` );
				}
				// Invoke the endpoint.
				this.Services[ ServiceName ].CallEndpoint( EndpointName, CommandParameters, CommandCallback );
				// Return, OK.
				return;
			},

	};
}


//---------------------------------------------------------------------
exports.ServiceClient = ServiceClient;

