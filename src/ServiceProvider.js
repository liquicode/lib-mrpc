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
		EachEndpoint:
			function EachEndpoint( Iterator )
			{
				let keys = Object.keys( this.Endpoints );
				keys.forEach( key => Iterator( this.Endpoints[ key ], key ) );
				// for ( let endpoint in this.Endpoints ) { Iterator( endpoint ); }
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
		Sleep:
			async function Sleep( Milliseconds )
			{
				return new Promise( resolve => setTimeout( resolve, Milliseconds ) );
			},

		//---------------------------------------------------------------------
		WaitWhile:
			async function WaitWhile( Condition )
			{
				return new Promise(
					async ( resolve, reject ) => 
					{
						while ( Condition() ) { await this.Sleep( 1 ); }
						resolve( true );
					} );
			},

		//---------------------------------------------------------------------
		WaitUntil:
			async function WaitUntil( Condition )
			{
				return new Promise(
					async ( resolve, reject ) => 
					{
						while ( !Condition() ) { await this.Sleep( 1 ); }
						resolve( true );
					} );
			},

		//---------------------------------------------------------------------
		OpenPort: async function OpenPort() { throw new Error( `OpenPort is not implemented in ServiceProvider.` ); },

		//---------------------------------------------------------------------
		ClosePort: async function ClosePort() { throw new Error( `ClosePort is not implemented in ServiceProvider.` ); },

		//---------------------------------------------------------------------
		AddEndpoint: async function AddEndpoint( EndpointName, CommandFunction ) { throw new Error( `AddEndpoint is not implemented in ServiceProvider.` ); },

		//---------------------------------------------------------------------
		CallEndpoint: async function CallEndpoint( EndpointName, CommandParameters, CommandCallback = null ) { throw new Error( `CallEndpoint is not implemented in ServiceProvider.` ); },

	};
}



//---------------------------------------------------------------------
exports.ServiceProvider = ServiceProvider;
