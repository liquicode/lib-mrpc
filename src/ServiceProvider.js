'use strict';


function EndpointManager()
{
	return {

		//---------------------------------------------------------------------
		Endpoints: {},

		//---------------------------------------------------------------------
		EndpointExists:
			function EndpointExists( EndpointName )
			{
				return ( typeof this.Endpoints[ EndpointName ] !== 'undefined' );
			},

		//---------------------------------------------------------------------
		AddEndpoint:
			function AddEndpoint( EndpointName, Handler )
			{
				let endpoint =
				{
					EndpointName: EndpointName,
					Handler: Handler,
				};
				this.Endpoints[ EndpointName ] = endpoint;
				return endpoint;
			},

		//---------------------------------------------------------------------
		RemoveEndpoint:
			function RemoveEndpoint( EndpointName )
			{
				if ( this.EndpointExists( EndpointName ) )
				{
					delete this.Endpoints[ EndpointName ];
				}
				return;
			},

		//---------------------------------------------------------------------
		HandleEndpoint:
			async function HandleEndpoint( EndpointName, Parameters )
			{
				if ( this.EndpointExists( EndpointName ) )
				{
					return await this.Endpoints[ EndpointName ].Handler( Parameters );
				}
				return;
			},
	};
}


//---------------------------------------------------------------------
function MessageManager()
{
	return {

		//---------------------------------------------------------------------
		Messages: [],

		//---------------------------------------------------------------------
		AddMessage:
			function AddMessage( Message )
			{
				this.Messages.push( Message );
				return;
			},

		//---------------------------------------------------------------------
		NextMessage:
			function NextMessage()
			{
				if ( this.Messages.length === 0 ) { return null; }
				let message = this.Messages[ 0 ];
				this.Messages = this.Messages.slice( 1 );
				return message;
			},

		//---------------------------------------------------------------------
		PeekMessage:
			function PeekMessage()
			{
				if ( this.Messages.length === 0 ) { return null; }
				let message = this.Messages[ 0 ];
				return message;
			},

		//---------------------------------------------------------------------
		ClearMessages:
			function ClearMessages()
			{
				this.Messages = [];
				return;
			},

	};
}


//---------------------------------------------------------------------
function ServiceProvider( ServiceName, Options )
{
	return {

		//---------------------------------------------------------------------
		ServiceName: ServiceName,
		Options: Options,
		IsPortOpen: false,
		EndpointManager: EndpointManager(),
		MessageManager: MessageManager(),

		//---------------------------------------------------------------------
		OpenPort: async function OpenPort() { throw new Error( `OpenPort is not implemented in ServiceProvider.` ); },

		//---------------------------------------------------------------------
		ClosePort: async function ClosePort() { throw new Error( `ClosePort is not implemented in ServiceProvider.` ); },

		//---------------------------------------------------------------------
		AddEndpoint: async function AddEndpoint( EndpointName, CommandFunction ) { throw new Error( `AddEndpoint is not implemented in ServiceProvider.` ); },

		//---------------------------------------------------------------------
		CallEndpoint: async function CallEndpoint( EndpointName, CommandParameters, ReplyCallback = null ) { throw new Error( `CallEndpoint is not implemented in ServiceProvider.` ); },

	};
}



//---------------------------------------------------------------------
exports.ServiceProvider = ServiceProvider;
