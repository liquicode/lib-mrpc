
const MOD_NOTIFY = require( './mq-notify-amqplib.js' );

const DATASET_TYPE = process.argv[ 2 ];
const MESSAGE_COUNT = parseInt( process.argv[ 3 ] );

// console.log( `- Publishing ${MESSAGE_COUNT} notification messages for dataset '${DATASET_NAME}':` );

( async () =>
{
	for ( let id = 1; id <= MESSAGE_COUNT; id++ )
	{
		await MOD_NOTIFY.publish( DATASET_TYPE, ( 100 + id ) );
	}
	process.exit( 0 );
} )();
