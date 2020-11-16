"use strict";


const LIB_ASSERT = require( 'assert' );


//---------------------------------------------------------------------
async function install_service_endpoints( Service )
{
	// Add the endpoint(s) for this scenario.
	// Echo just returns whatever was passed to it.
	await Service.AddEndpoint( 'echo', ( Parameters ) => Parameters );
	return;
}


//---------------------------------------------------------------------
async function run_tests( Client, Options = {} )
{
	let result = null;
	// Test the endpoints.
	let max_count = Options.iterations ? Options.iterations : 100;
	let reply_count = 0;
	console.log( `Sending ${max_count} requests.` );
	for ( let index = 1; index <= max_count; index++ )
	{
		let endpoint_reply = await Client.CallEndpoint( 'echo', index,
			function ( error, reply )
			{
				if ( error )
				{
					console.error( `Error in [echo] reply callback.` );
					console.error( error.message, error );
					reply_count++;
					return;
				}
				LIB_ASSERT.ok( reply === index );
				reply_count++;
				return;
			} );
		LIB_ASSERT.ok( endpoint_reply === index );
	}
	console.log( `Received ${reply_count}/${max_count} replies.` );
	result = await Client.WaitWhile( () => reply_count < max_count );
	console.log( `Received ${reply_count}/${max_count} replies.` );
	return;
}


//---------------------------------------------------------------------
exports.install_service_endpoints = install_service_endpoints;
exports.run_tests = run_tests;

