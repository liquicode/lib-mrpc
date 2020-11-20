'use strict';


//=====================================================================
//=====================================================================
//
//		Local Service Providers
//
//=====================================================================
//=====================================================================


//---------------------------------------------------------------------
const LIB_IMMEDIATE_SERVICE_PROVIDER = require( './ImmediateServiceProvider.js' );
exports.ImmediateServiceProvider = LIB_IMMEDIATE_SERVICE_PROVIDER.ImmediateServiceProvider;


//---------------------------------------------------------------------
const LIB_DEFERRED_SERVICE_PROVIDER = require( './DeferredServiceProvider.js' );
exports.DeferredServiceProvider = LIB_DEFERRED_SERVICE_PROVIDER.DeferredServiceProvider;


//---------------------------------------------------------------------
const LIB_WORKER_THREAD_SERVICE_PROVIDER = require( './WorkerThreadServiceProvider.js' );
exports.WorkerThreadServiceProvider = LIB_WORKER_THREAD_SERVICE_PROVIDER.WorkerThreadServiceProvider;


//=====================================================================
//=====================================================================
//
//		Remote Service Providers
//			- Message Queues
//
//=====================================================================
//=====================================================================


//---------------------------------------------------------------------
const LIB_STOMP_SERVICE_PROVIDER = require( './StompServiceProvider.js' );
exports.StompServiceProvider = LIB_STOMP_SERVICE_PROVIDER.StompServiceProvider;


//---------------------------------------------------------------------
const LIB_TORTOISE_SERVICE_PROVIDER = require( './TortoiseServiceProvider.js' );
exports.TortoiseServiceProvider = LIB_TORTOISE_SERVICE_PROVIDER.TortoiseServiceProvider;


//---------------------------------------------------------------------
const LIB_AMQPLIB_SERVICE_PROVIDER = require( './AmqpLibServiceProvider.js' );
exports.AmqpLibServiceProvider = LIB_AMQPLIB_SERVICE_PROVIDER.AmqpLibServiceProvider;


//=====================================================================
//=====================================================================
//
//		Remote Service Providers
//			- Pub/Sub
//
//=====================================================================
//=====================================================================


//---------------------------------------------------------------------
const LIB_REDIS_SERVICE_PROVIDER = require( './RedisServiceProvider.js' );
exports.RedisServiceProvider = LIB_REDIS_SERVICE_PROVIDER.RedisServiceProvider;


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
