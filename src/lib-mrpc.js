'use strict';


//=====================================================================
//=====================================================================
//
//		Service Provider Factory
//
//=====================================================================
//=====================================================================


exports.ServiceProviderFactory = ServiceProviderFactory;
function ServiceProviderFactory( ProviderName, ServiceName, ProviderOptions )
{
	// Native Service Providers
	if ( ProviderName === 'ImmediateServiceProvider' )
	{
		return require( './ImmediateServiceProvider.js' ).ImmediateServiceProvider( ServiceName, ProviderOptions );
	}
	if ( ProviderName === 'DeferredServiceProvider' )
	{
		return require( './DeferredServiceProvider.js' ).DeferredServiceProvider( ServiceName, ProviderOptions );
	}
	if ( ProviderName === 'WorkerThreadServiceProvider' )
	{
		return require( './WorkerThreadServiceProvider.js' ).WorkerThreadServiceProvider( ServiceName, ProviderOptions );
	}

	// Local Service Providers
	if ( ProviderName === 'FSWatchServiceProvider' )
	{
		return require( './FSWatchServiceProvider.js' ).FSWatchServiceProvider( ServiceName, ProviderOptions );
	}

	// Remote Service Providers
	if ( ProviderName === 'AmqpLibServiceProvider' )
	{
		return require( './AmqpLibServiceProvider.js' ).AmqpLibServiceProvider( ServiceName, ProviderOptions );
	}
	if ( ProviderName === 'TortoiseServiceProvider' )
	{
		return require( './TortoiseServiceProvider.js' ).TortoiseServiceProvider( ServiceName, ProviderOptions );
	}
	if ( ProviderName === 'RedisServiceProvider' )
	{
		return require( './RedisServiceProvider.js' ).RedisServiceProvider( ServiceName, ProviderOptions );
	}

	// Unknown.
	return null;
};


//=====================================================================
//=====================================================================
//
//		Service Providers (Strongly Typed)
//
//=====================================================================
//=====================================================================


// Native Service Providers
exports.ImmediateServiceProvider = ( ServiceName, ProviderOptions ) => { return ServiceProviderFactory( 'ImmediateServiceProvider', ServiceName, ProviderOptions ); };
exports.DeferredServiceProvider = ( ServiceName, ProviderOptions ) => { return ServiceProviderFactory( 'DeferredServiceProvider', ServiceName, ProviderOptions ); };
exports.WorkerThreadServiceProvider = ( ServiceName, ProviderOptions ) => { return ServiceProviderFactory( 'WorkerThreadServiceProvider', ServiceName, ProviderOptions ); };

// Local Service Providers
exports.FSWatchServiceProvider = ( ServiceName, ProviderOptions ) => { return ServiceProviderFactory( 'FSWatchServiceProvider', ServiceName, ProviderOptions ); };

// Remote Service Providers - Message Queues
exports.AmqpLibServiceProvider = ( ServiceName, ProviderOptions ) => { return ServiceProviderFactory( 'AmqpLibServiceProvider', ServiceName, ProviderOptions ); };
exports.TortoiseServiceProvider = ( ServiceName, ProviderOptions ) => { return ServiceProviderFactory( 'TortoiseServiceProvider', ServiceName, ProviderOptions ); };
// exports.StompitServiceProvider = ( ServiceName, ProviderOptions ) => { return ServiceFactory( 'StompitServiceProvider', ServiceName, ProviderOptions ); };

// Remote Service Providers - Pub/Sub
exports.RedisServiceProvider = ( ServiceName, ProviderOptions ) => { return ServiceProviderFactory( 'RedisServiceProvider', ServiceName, ProviderOptions ); };


//=====================================================================
//=====================================================================
//
//		Service Client
//
//=====================================================================
//=====================================================================


exports.ServiceClient = () => { return require( './ServiceClient.js' ).ServiceClient(); };

