"use strict";


const LIB_ASSERT = require( 'assert' );


var LOG = false;


//---------------------------------------------------------------------
async function install_service_endpoints( Service )
{
	// Add the endpoint(s) for this scenario.
	// 'echo error' always throws an error.
	await Service.AddEndpoint( 'echo error',
		( Parameters ) => 
		{
			throw new Error( `Echo Error: ${JSON.stringify( Parameters )}` );
		} );
	return;
}


//---------------------------------------------------------------------
async function run_tests( Client, Options = {} )
{
	// Test the 'echo error' endpoint.
	if ( LOG ) { console.log( '---------------------------------------------------------------------' ); }
	if ( LOG ) { console.time( 'echo error' ); }
	let iteration_count = Options.iterations ? Options.iterations : 10;
	let echo_count = 0;
	if ( LOG ) { console.log( `Sending ${iteration_count} 'echo error' requests.` ); }
	for ( let index = 1; index <= iteration_count; index++ )
	{
		let endpoint_reply = null;
		try
		{
			endpoint_reply = await Client.CallEndpoint(
				'echo error',
				index,
				function ( error, reply )
				{
					// Since we supplied a callback, we see the result here.
					LIB_ASSERT.ok( error.message === `Echo Error: ${index}` );
					echo_count++;
				} );
		}
		catch ( error )
		{
			// Since we awaited the call, we also see the result here.
			LIB_ASSERT.ok( error.message === `Echo Error: ${index}` );
		}
		LIB_ASSERT.ok( endpoint_reply === null );
	}
	if ( LOG ) { console.log( `Received ${echo_count}/${iteration_count} 'echo error' replies.` ); }
	let result = await Client.WaitWhile( () => ( echo_count < iteration_count ) );
	if ( LOG ) { console.log( `Received ${echo_count}/${iteration_count} 'echo error' replies.` ); }
	if ( LOG ) { console.timeEnd( 'echo error' ); }
	return;
}


//---------------------------------------------------------------------
exports.install_service_endpoints = install_service_endpoints;
exports.run_tests = run_tests;

