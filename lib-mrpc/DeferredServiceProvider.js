'use strict';


const LIB_ENDPOINTS_MANAGER = require( './EndpointsManager.js' );


/*
let Options =
{
};
*/


exports.DeferredServiceProvider =
	function DeferredServiceProvider( ServiceName, Options )
	{
		return {


			//---------------------------------------------------------------------
			ServiceName: ServiceName,
			Options: Options,
			Endpoints: LIB_ENDPOINTS_MANAGER.NewEndpoints(),
			IsPortOpen: false,
			Messages: [],


			//---------------------------------------------------------------------
			process_next_message:
				async function process_next_message()
				{
					if ( !this.Messages.length ) { return; }
					// Dequeue the next message.
					let message = this.Messages[ 0 ];
					this.Messages = this.Messages.slice( 1 );
					// Invoke the endpoint.
					try
					{
						let result = await this.Endpoints.HandleEndpoint( message.EndpointName, message.CommandParameters );
						if ( message.ReplyCallback ) { message.ReplyCallback( null, result ); }
					}
					catch ( error )
					{
						if ( message.ReplyCallback ) { message.ReplyCallback( error, null ); }
					}
					return;
				},


			//---------------------------------------------------------------------
			// A service opens a port to listen for connections.
			OpenPort:
				async function OpenPort()
				{
					this.IsPortOpen = true;
					while ( this.IsPortOpen )
					{
						setImmediate( () => this.process_next_message() );
						// await process_next_message();
						await new Promise( resolve => setTimeout( resolve, 1 ) );
					}
					return;
				},


			//---------------------------------------------------------------------
			// A service can close its port to stop listening for connections.
			ClosePort:
				async function ClosePort()
				{
					this.IsPortOpen = false;
					let message_count = this.Messages.length;
					if ( message_count > 0 )
					{
						// throw new Error( `There are still [${message_count}] messages left in the queue.` );
						console.warn( `The port was closed but there are still [${message_count}] messages left in the queue.` );
					}
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

					// Remove any messages destined for this endpoint.
					// TODO

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
					// Build the message.
					let message =
					{
						EndpointName: EndpointName,
						CommandParameters: CommandParameters,
						ReplyCallback: ReplyCallback,
					};
					// Queue the message.
					this.Messages.push( message );
					// Return, OK.
					return;
				},

		};
		return;
	};


