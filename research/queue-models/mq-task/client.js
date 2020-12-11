
const MOD_TASK = require( './mq-task-amqplib.js' );

const TASK_TYPE = process.argv[ 2 ];
const MESSAGE_COUNT = parseInt( process.argv[ 3 ] );

// console.log( `- Publishing ${MESSAGE_COUNT} submissions for '${TASK_TYPE}' tasks:` );

( async () =>
{
	for ( let id = 1; id <= MESSAGE_COUNT; id++ )
	{
		await MOD_TASK.publish( TASK_TYPE, ( 100 + id ) );
	}
	process.exit( 0 );
} )();
