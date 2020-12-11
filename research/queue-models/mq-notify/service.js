
const MOD_NOTIFY = require( './mq-notify-amqplib.js' );

const DATASET_TYPE = process.argv[ 2 ];
const ERROR_RATE = parseFloat( process.argv[ 3 ] );

// console.log( `- Subscribing [${process.pid}] to notifications on dataset '${DATASET_NAME}':` );
MOD_NOTIFY.subscribe( DATASET_TYPE,
	async ( Notification ) =>
	{
		console.log( `[s-${process.pid}] Received notification for '${DATASET_TYPE}' #${Notification.id}` );
		if ( ERROR_RATE && ( Math.random() <= ERROR_RATE ) ) 
		{
			throw new Error( `[s-${process.pid}] Simulated Error` );
		}
		return;
	} );
