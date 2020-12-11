
// Reference Tortoise to handle AMQP protocol details.
const LIB_TORTOISE = require( 'tortoise' );

// Address and connection options for our AMQP server.
const MQ_SERVER = 'amqp://localhost:5672';
const MQ_CONNECT_OPTIONS =
{
	connectRetries: 30,
	connectRetryInterval: 1000,
};


//---------------------------------------------------------------------
// Function to send notification messages to the message queue.
exports.publish =
	async function publish( DatasetType, DatasetID )
	{
		console.log( `[p-${process.pid}] Notifying change in '${DatasetType}' #${DatasetID}.` );

		// Construct the notification message.
		let notification_object =
		{
			id: DatasetID,
		};
		let message = JSON.stringify( notification_object );

		// Connect to the message queue.
		let amqp_client = new LIB_TORTOISE( MQ_SERVER, MQ_CONNECT_OPTIONS );
		amqp_client.on( LIB_TORTOISE.EVENTS.PARSEERROR, () => console.log( `Parse error.` ) );
		amqp_client.on( LIB_TORTOISE.EVENTS.CONNECTIONCLOSED, () => console.log( `Connection closed.` ) );
		amqp_client.on( LIB_TORTOISE.EVENTS.CONNECTIONDISCONNECTED, () => console.log( `Connection disconnected.` ) );

		// Send notification message to the message queue.
		await amqp_client
			// .queue( DatasetType, { durable: false } )
			// .publish( message )
			// .exchange( 'amq.fanout', 'fanout', DatasetType, { durable: true } )
			.exchange( 'amq.fanout', 'fanout', { durable: true } )
			.publish( DatasetType, message )
			// .publish( DatasetType, message )
			;

		// Return.
		return;
	};


//---------------------------------------------------------------------
// Function to subcribe to notification messages and send them to a notification handler.
exports.subscribe =
	async function subscribe( DatasetType, OnNotification )
	{
		// Connect to the message queue.
		let amqp_client = new LIB_TORTOISE( MQ_SERVER, MQ_CONNECT_OPTIONS );
		amqp_client.on( LIB_TORTOISE.EVENTS.PARSEERROR, () => console.log( `Parse error.` ) );
		amqp_client.on( LIB_TORTOISE.EVENTS.CONNECTIONCLOSED, () => console.log( `Connection closed.` ) );
		amqp_client.on( LIB_TORTOISE.EVENTS.CONNECTIONDISCONNECTED, () => console.log( `Connection disconnected.` ) );

		let channel = await amqp_client
			.queue( DatasetType, { durable: false } )
			// .queue()
			// .exchange( 'amq.fanout', 'fanout', { durable: true } )
			.exchange( 'amq.fanout', 'fanout', DatasetType, { durable: true } )
			.prefetch( 1 )
			.subscribe(
				async function ( QueueMessage, QAck, QNack )
				{
					// Convert the message to a notification object.
					let notification_object = JSON.parse( QueueMessage );

					// Process the message.
					try 
					{
						// Call the worker to process the notification.
						await OnNotification( notification_object );

						// Acknowledge successful processing of this
						// message to the message queue.
						await QAck();
					}
					catch ( error ) 
					{
						// Print the error.
						console.error( error );

						// Tell the message queue that the message
						// was not processed and to not requeue the message.
						await QNack( false );
					}

					// Return.
					return;
				} );

		// Return.
		console.log( `[s-${process.pid}] Subscribed to '${DatasetType}' change notifications.` );
		return;
	};
