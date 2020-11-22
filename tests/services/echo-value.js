"use strict";


const LIB_ASSERT = require( 'assert' );


var LOG = false;


//---------------------------------------------------------------------
async function install_service_endpoints( Service )
{
	// Add the endpoint(s) for this scenario.
	// 'echo value' just returns whatever was passed to it.
	await Service.AddEndpoint( 'echo value', ( Parameters ) => Parameters );
	return;
}


//---------------------------------------------------------------------
async function run_tests( Client, Options = {} )
{
	// Test the 'echo value' endpoint.
	if ( LOG ) { console.log( '---------------------------------------------------------------------' ); }
	if ( LOG ) { console.time( 'echo value' ); }
	let iteration_count = Options.iterations ? Options.iterations : 10;
	let echo_count = 0;
	if ( LOG ) { console.log( `Sending ${iteration_count} 'echo value' requests.` ); }
	for ( let index = 1; index <= iteration_count; index++ )
	{
		let endpoint_reply = null;
		endpoint_reply = await Client.CallEndpoint(
			'echo value',
			index,
			function ( error, reply )
			{
				// Since we supplied a callback, we see the result here.
				LIB_ASSERT.ok( reply === index );
				echo_count++;
			} );
		// Since we awaited the call, we also see the result here.
		LIB_ASSERT.ok( endpoint_reply === index );
	}
	if ( LOG ) { console.log( `Received ${echo_count}/${iteration_count} 'echo value' replies.` ); }
	let result = await Client.WaitWhile( () => ( echo_count < iteration_count ) );
	if ( LOG ) { console.log( `Received ${echo_count}/${iteration_count} 'echo value' replies.` ); }
	if ( LOG ) { console.timeEnd( 'echo value' ); }
}


//---------------------------------------------------------------------
exports.install_service_endpoints = install_service_endpoints;
exports.run_tests = run_tests;

