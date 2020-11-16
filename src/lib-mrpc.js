'use strict';


//---------------------------------------------------------------------
const LIB_IMMEDIATE_SERVICE_PROVIDER = require( './ImmediateServiceProvider.js' );
exports.ImmediateServiceProvider = LIB_IMMEDIATE_SERVICE_PROVIDER.ImmediateServiceProvider;


//---------------------------------------------------------------------
const LIB_DEFERRED_SERVICE_PROVIDER = require( './DeferredServiceProvider.js' );
exports.DeferredServiceProvider = LIB_DEFERRED_SERVICE_PROVIDER.DeferredServiceProvider;


//---------------------------------------------------------------------
const LIB_WORKER_THREAD_SERVICE_PROVIDER = require( './WorkerThreadServiceProvider.js' );
exports.WorkerThreadServiceProvider = LIB_WORKER_THREAD_SERVICE_PROVIDER.WorkerThreadServiceProvider;


// //---------------------------------------------------------------------
// const LIB_STOMP_SERVICE_PROVIDER = require( './StompServiceProvider.js' );
// exports.StompServiceProvider = LIB_STOMP_SERVICE_PROVIDER.StompServiceProvider;


// //---------------------------------------------------------------------
// const LIB_TORTOISE_SERVICE_PROVIDER = require( './TortoiseServiceProvider.js' );
// exports.TortoiseServiceProvider = LIB_TORTOISE_SERVICE_PROVIDER.TortoiseServiceProvider;


//---------------------------------------------------------------------
const LIB_AMQPLIB_SERVICE_PROVIDER = require( './AmqpLibServiceProvider.js' );
exports.AmqpLibServiceProvider = LIB_AMQPLIB_SERVICE_PROVIDER.AmqpLibServiceProvider;


//---------------------------------------------------------------------
// const LIB_THREAD_CHANNEL_PROVIDER = require( './ThreadChannelProvider.js' );
// exports.ThreadChannelProvider = LIB_THREAD_CHANNEL_PROVIDER.ThreadChannelProvider;


//=====================================================================
//=====================================================================
//
//		Service Client
//
//=====================================================================
//=====================================================================


exports.ServiceClient =
{


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
