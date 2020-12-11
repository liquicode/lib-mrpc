
const MOD_TASK = require( './mq-task-amqplib.js' );

const TASK_TYPE = process.argv[ 2 ];
const ERROR_RATE = parseFloat( process.argv[ 3 ] );

// console.log( `- Subscribing [${process.pid}] to submissions for '${TASK_TYPE}' tasks:` );
MOD_TASK.subscribe( TASK_TYPE,
	async ( Task ) =>
	{
		console.log( `[s-${process.pid}] Received a submission for a '${TASK_TYPE}' task #${Task.id}` );
		let sleep_milliseconds = parseInt( 3000 * Math.random() );
		await new Promise( resolve => setTimeout( resolve, sleep_milliseconds ) );
		if ( ERROR_RATE && ( Math.random() <= ERROR_RATE ) ) 
		{
			console.log( `[s-${process.pid}] Simulating error in '${TASK_TYPE}' task #${Task.id} after ${sleep_milliseconds} ms.` );
			throw new Error( `[s-${process.pid}] Simulated Error` );
		}
		console.log( `[s-${process.pid}] completed '${TASK_TYPE}' task #${Task.id} after ${sleep_milliseconds} ms.` );
		return;
	} );
