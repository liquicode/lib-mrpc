
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
	async function publish( TaskType, TaskID )
	{
		console.log( `[${process.pid}] Submitting job '${TaskType}' with ID of ${TaskID}.` );

		// Construct the notification message.
		let submission_object =
		{
			id: TaskID,
		};
		let message = JSON.stringify( submission_object );

		// Connect to the message queue.
		let amqp_client = new LIB_TORTOISE( MQ_SERVER, MQ_CONNECT_OPTIONS );
		amqp_client.on( LIB_TORTOISE.EVENTS.PARSEERROR, () => console.log( `Parse error.` ) );
		amqp_client.on( LIB_TORTOISE.EVENTS.CONNECTIONCLOSED, () => console.log( `Connection closed.` ) );
		amqp_client.on( LIB_TORTOISE.EVENTS.CONNECTIONDISCONNECTED, () => console.log( `Connection disconnected.` ) );

		// Send notification message to the message queue.
		await amqp_client
			// .queue( JobType, { durable: true } )
			// .publish( message )
			.exchange( 'amq.direct', 'direct', { durable: true } )
			.publish( TaskType, message )
			;

		// Return.
		return;
	};


//---------------------------------------------------------------------
// Function to subcribe to notification messages and send them to a notification handler.
exports.subscribe =
	async function subscribe( TaskType, OnSubmission )
	{
		// Connect to the message queue.
		let amqp_client = new LIB_TORTOISE( MQ_SERVER, MQ_CONNECT_OPTIONS );
		amqp_client.on( LIB_TORTOISE.EVENTS.PARSEERROR, () => console.log( `Parse error.` ) );
		amqp_client.on( LIB_TORTOISE.EVENTS.CONNECTIONCLOSED, () => console.log( `Connection closed.` ) );
		amqp_client.on( LIB_TORTOISE.EVENTS.CONNECTIONDISCONNECTED, () => console.log( `Connection disconnected.` ) );

		let channel = await amqp_client
			.queue( TaskType, { durable: false } )
			.exchange( 'amq.direct', 'direct', TaskType, { durable: true } )
			.failThreshold( 3 ) // 3 immediate attempts
			.failSpan( 1000 * 60 * 10 ) // 10 minutes, defaults to 1 minute
			.retryTimeout( 1000 * 10 ) // 10 second timeout on each retry, defaults to 5 seconds
			.prefetch( 1 )
			.subscribe(
				async function ( QueueMessage, QAck, QNack )
				{
					// Convert the message to a job submission object.
					let submission_object = JSON.parse( QueueMessage );

					// Process the message.
					try 
					{
						// Call the worker to process the job submission.
						await OnSubmission( submission_object );

						// Acknowledge successful processing of this
						// message to the message queue.
						QAck();
					}
					catch ( error ) 
					{
						// Print the error.
						console.error( error );

						// Tell the message queue that the message
						// was not processed and to requeue the message.
						QNack( true );
					}

					// Return.
					return;
				} );

		// Return.
		console.log( `[${process.pid}] Subscribed to submissions for job type '${TaskType}'.` );
		return channel;
	};
