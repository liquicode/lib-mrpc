'use strict';


const LIB_CRYPTO = require( "crypto" );


//---------------------------------------------------------------------
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
		RandomID:
			function RandomID( Size = 12 )
			{
				function map_byte_value( Value, Min, Max )
				{
					Value /= 255;				// Convert Value to a percentage of its original range (0-255).
					Value *= ( Max - Min );		// Map Value to the target range.
					Value += Min;				// Shift Value to reside within the target range.
					return Math.round( Value );
				}

				let alphabet = 'abcdefghijklmnopqrstuvwxyz1234567890';
				let alphabet_1st = 'abcdefghijklmnopqrstuvwxyz';
				let values = LIB_CRYPTO.randomBytes( Size );
				let result = '';
				for ( let index = 0; index < Size; index++ )
				{
					if ( index === 0 )
					{
						// Make sure the 1st character of the ID is non-numeric.
						result += alphabet_1st[ map_byte_value( values[ index ], 0, alphabet_1st.length - 1 ) ];
					}
					else
					{
						// Use the entire alphabet for the rest of the ID.
						result += alphabet[ map_byte_value( values[ index ], 0, alphabet.length - 1 ) ];
					}
				}
				return result;
			},

		// //---------------------------------------------------------------------
		// RandomID:
		// 	function RandomID( Size = 12 )
		// 	{
		// 		let alphabet = 'abcdefghijklmnopqrstuvwxyz1234567890';
		// 		let alphabet_1st = 'abcdefghijklmnopqrstuvwxyz';
		// 		let result = '';
		// 		for ( let index = 0; index < Size; index++ )
		// 		{
		// 			// ALERT: LIB_CRYPTO.randomInt requires Node v14.10.0, v12.19.0
		// 			if ( index === 0 )
		// 			{
		// 				// Make sure the 1st character of the ID is non-numeric.
		// 				result += alphabet_1st[ LIB_CRYPTO.randomInt( 0, alphabet_1st.length - 1 ) ];
		// 			}
		// 			else
		// 			{
		// 				// Use the entire alphabet for the rest of the ID.
		// 				result += alphabet[ LIB_CRYPTO.randomInt( 0, alphabet.length - 1 ) ];
		// 			}
		// 		}
		// 		return result;
		// 	},

		//---------------------------------------------------------------------
		ApplyDefaultOptions:
			function ApplyDefaultOptions( UserOptions )
			{
				function apply_defaults( Options, Defaults )
				{
					let keys = Object.keys( Defaults );
					for ( let index = 0; index < keys.length; index++ )
					{
						let key = keys[ index ];
						if ( ( typeof Defaults[ key ] === 'object' ) && ( Defaults[ key ] !== null ) )
						{
							if ( typeof Options[ key ] === 'undefined' )
							{
								Options[ key ] = {};
							}
							apply_defaults( Options[ key ], Defaults[ key ] );
						}
						else if ( typeof Options[ key ] === 'undefined' )
						{
							Options[ key ] = Defaults[ key ];
						}
					}
					return;
				}
				UserOptions = UserOptions || {};
				let options = JSON.parse( JSON.stringify( UserOptions ) );
				apply_defaults( options, this.DefaultOptions() );
				return options;
			},

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
		DefaultOptions: function DefaultOptions() { throw new Error( `DefaultOptions is not implemented in ServiceProvider.` ); },

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
