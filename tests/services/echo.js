"use strict";


const LIB_ASSERT = require( 'assert' );


//---------------------------------------------------------------------
async function install_service_endpoints( Service )
{
	// Add the endpoint(s) for this scenario.
	// 'echo value' just returns whatever was passed to it.
	await Service.AddEndpoint( 'echo value', ( Parameters ) => Parameters );
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
	let result = null;

	// Test the 'echo value' endpoint.
	console.log( '---------------------------------------------------------------------' );
	console.time( 'echo value' );
	let iteration_count = Options.iterations ? Options.iterations : 100;
	let echo_count = 0;
	console.log( `Sending ${iteration_count} 'echo value' requests.` );
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
	console.log( `Received ${echo_count}/${iteration_count} 'echo value' replies.` );
	result = await Client.WaitWhile( () => ( echo_count < iteration_count ) );
	console.log( `Received ${echo_count}/${iteration_count} 'echo value' replies.` );
	console.timeEnd( 'echo value' );

	// Test the 'echo error' endpoint.
	console.log( '---------------------------------------------------------------------' );
	console.time( 'echo error' );
	iteration_count = Options.iterations ? Options.iterations : 100;
	echo_count = 0;
	console.log( `Sending ${iteration_count} 'echo error' requests.` );
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
	console.log( `Received ${echo_count}/${iteration_count} 'echo error' replies.` );
	result = await Client.WaitWhile( () => ( echo_count < iteration_count ) );
	console.log( `Received ${echo_count}/${iteration_count} 'echo error' replies.` );
	console.timeEnd( 'echo error' );

	return;
}


//---------------------------------------------------------------------
exports.install_service_endpoints = install_service_endpoints;
exports.run_tests = run_tests;

