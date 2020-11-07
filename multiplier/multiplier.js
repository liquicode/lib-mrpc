'use strict';


const LIB_MRPC = require( '../lib-mrpc/lib-mrpc.js' );

const MULTIPLIER_SERVICE_NAME = 'test.multiplier';


//---------------------------------------------------------------------
// Initialize table
// - Returns a properly sized table filled with nulls.
function table_initialize( Size )
{
	var table = [];
	for ( let i = 0; i < Size; i++ )
	{
		let row = [];
		for ( let j = 0; j < Size; j++ )
		{
			row.push( null );
		}
		table.push( row );
	}
	return table;
}


//---------------------------------------------------------------------
// Wait for completion
// - Returns percent (0..1) completed.
function table_completed( Table )
{
	let cell_count = 0;
	let value_count = 0;
	for ( let i = 0; i < Table.length; i++ )
	{
		for ( let j = 0; j < Table[ i ].length; j++ )
		{
			cell_count++;
			if ( Table[ i ][ j ] !== null ) { value_count++; }
		}
	}
	return ( value_count / cell_count );
}


//---------------------------------------------------------------------
// Output the table
// - Print the table to the console.
function table_print( Table )
{
	for ( let i = 0; i < Table.length; i++ )
	{
		let line = '';
		for ( let j = 0; j < Table[ i ].length; j++ )
		{
			line += ( '' + Table[ i ][ j ] ) + '\t';
		}
		console.log( line );
	}
	return;
}


//---------------------------------------------------------------------
// Populate table
// - Issue Multiply requests for each cell in the table.
function table_populate( ServiceClient, Table )
{
	for ( let i = 0; i < Table.length; i++ )
	{
		for ( let j = 0; j < Table[ i ].length; j++ )
		{
			ServiceClient.CallEndpoint(
				MULTIPLIER_SERVICE_NAME,
				'Multiply',
				{ arg1: i + 1, arg2: j + 1 },
				( Err, Data ) =>
				{
					if ( Err ) { throw Err; }
					Table[ Data.arg1 - 1 ][ Data.arg2 - 1 ] = Data.result;
					return;
				}
			);
		}
	}
	return;
}


//---------------------------------------------------------------------
async function sleep( Milliseconds )
{
	return new Promise( resolve => setTimeout( resolve, Milliseconds ) );
};


// Construct a multiplication table
var LAST_COMPLETED = null;
async function create_multiplication_table( ServiceClient, Size )
{
	console.log(`Initializing table...`)
	let table = table_initialize( Size );

	console.log(`Populating table...`)
	table_populate( ServiceClient, table );
	
	console.log(`Wating for table completion...`)
	let completed = 0;
	while ( completed < 1 )
	{
		// setImmediate( () => { completed = table_completed( table ); } );
		await sleep( 100 );
		completed = table_completed( table );
		if ( completed !== LAST_COMPLETED )
		{
			console.log( `${Date.now() / 1000} | Completion: ${completed}` );
			LAST_COMPLETED = completed;
		}
	}
	
	console.log(`Table created.`)
	return table;
}


( async () =>
{
	// let multiplier_service = await require( './MultiplierServiceFactory.js' ).ImmediateMultiplierService();
	// let multiplier_service = await require( './MultiplierServiceFactory.js' ).DeferredMultiplierService();
	let multiplier_service = await require( './MultiplierServiceFactory.js' ).ThreadWorkerMultiplierService();
	// let multiplier_service = await require( './MultiplierServiceFactory.js' ).StompMultiplierService();
	// let multiplier_service = await require( './MultiplierServiceFactory.js' ).TortoiseMultiplierService();
	// let multiplier_service = await require( './MultiplierServiceFactory.js' ).AmqpLibMultiplierService();
	let service_client = LIB_MRPC.ServiceClient;
	service_client.ConnectService( multiplier_service );
	let start_time = Date.now();
	let table = await create_multiplication_table( service_client, 10 );
	let end_time = Date.now();
	service_client.DisconnectService( multiplier_service.ServiceName );
	console.log( `Completed in ${end_time - start_time} ms.` );
	table_print( table );
	process.exit( 0 );
} )();


