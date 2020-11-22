'use strict';


//=====================================================================
//=====================================================================
//
//		Native Service Providers
//
//=====================================================================
//=====================================================================


exports.ImmediateServiceProvider = ( ServiceName, Options ) => { return require( './ImmediateServiceProvider.js' ).ImmediateServiceProvider( ServiceName, Options ); };
exports.DeferredServiceProvider = ( ServiceName, Options ) => { return require( './DeferredServiceProvider.js' ).DeferredServiceProvider( ServiceName, Options ); };
exports.WorkerThreadServiceProvider = ( ServiceName, Options ) => { return require( './WorkerThreadServiceProvider.js' ).WorkerThreadServiceProvider( ServiceName, Options ); };


//=====================================================================
//=====================================================================
//
//		Local Service Providers
//
//=====================================================================
//=====================================================================


exports.FSWatchServiceProvider = ( ServiceName, Options ) => { return require( './FSWatchServiceProvider.js' ).FSWatchServiceProvider( ServiceName, Options ); };


//=====================================================================
//=====================================================================
//
//		Remote Service Providers
//			- Message Queues
//
//=====================================================================
//=====================================================================


exports.AmqpLibServiceProvider = ( ServiceName, Options ) => { return require( './AmqpLibServiceProvider.js' ).AmqpLibServiceProvider( ServiceName, Options ); };
exports.TortoiseServiceProvider = ( ServiceName, Options ) => { return require( './TortoiseServiceProvider.js' ).TortoiseServiceProvider( ServiceName, Options ); };
// exports.StompitServiceProvider = ( ServiceName, Options ) => { return require( './StompitServiceProvider.js' ).StompitServiceProvider( ServiceName, Options ); };


//=====================================================================
//=====================================================================
//
//		Remote Service Providers
//			- Pub/Sub
//
//=====================================================================
//=====================================================================


exports.RedisServiceProvider = ( ServiceName, Options ) => { return require( './RedisServiceProvider.js' ).RedisServiceProvider( ServiceName, Options ); };


//=====================================================================
//=====================================================================
//
//		Service Client
//
//=====================================================================
//=====================================================================


exports.ServiceClient = () => { return require( './ServiceClient.js' ).ServiceClient(); };

