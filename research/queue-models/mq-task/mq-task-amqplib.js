/*
### mq-task

This module provides functions to `publish` and `subcribe` to a task queue.

The task queue is a single queue that can have many publishers and many subscribers.

The configuration has the following features:
- Each subscriber processes only one message at a time.
- Each message is processed by only one subscriber.
- When an error occurs while processing a message by a subscriber, that message is requeued.
- When there are no messages in the queue and there are no connected publishers or subscribers,
	then the queue is deleted.
- The queue is durable and messages in the queue will survive a message queue restart.

*/
// Reference amqplib to handle AMQP protocol details.
const LIB_AMQPLIB = require( 'amqplib' );

// Address and connection options for our AMQP server.
const MQ_SERVER = 'amqp://localhost:5672';
const MQ_SERVER_OPTIONS =
{
	connectRetries: 30,
	connectRetryInterval: 1000,
};
const MQ_EXCHANGE_OPTIONS =
{
	durable: true,
};
const MQ_QUEUE_OPTIONS =
{
	exclusive: false,
	durable: true,
	autoDelete: true,
};
const MQ_MESSAGE_OPTIONS =
{
	contentType: "text/plain",
	deliveryMode: true,
	persistent: true,
};


//---------------------------------------------------------------------
// Function to send notification messages to the message queue.
exports.publish =
	async function publish( TaskType, TaskID )
	{
		console.log( `[p-${process.pid}] Submitting job '${TaskType}' with ID of ${TaskID}.` );

		// Construct the notification message.
		let submission_object =
		{
			id: TaskID,
		};
		let message = JSON.stringify( submission_object );

		// Connect to the message queue.
		let amqp_client = await LIB_AMQPLIB.connect( MQ_SERVER, MQ_SERVER_OPTIONS );

		// Send notification message to the message queue.
		let channel = await amqp_client.createChannel();
		let result = null;
		result = await channel.assertQueue( TaskType, MQ_QUEUE_OPTIONS );
		result = await channel.sendToQueue( TaskType, Buffer.from( message ), MQ_MESSAGE_OPTIONS );
		await channel.close();

		// Return.
		return;
	};


//---------------------------------------------------------------------
// Function to subcribe to notification messages and send them to a notification handler.
exports.subscribe =
	async function subscribe( TaskType, OnTask )
	{
		// Connect to the message queue.
		let amqp_client = await LIB_AMQPLIB.connect( MQ_SERVER, MQ_SERVER_OPTIONS );

		let channel = await amqp_client.createChannel();
		let result = null;
		result = await channel.prefetch( 1 );
		result = await channel.assertQueue( TaskType, MQ_QUEUE_OPTIONS );
		result = await channel.consume( TaskType,
			async ( QueueMessage ) =>
			{
				// Convert the message to a job submission object.
				if ( !QueueMessage ) { return; }
				let message = QueueMessage.content.toString();
				let task_object = JSON.parse( message );

				// Process the message.
				try 
				{
					// Call the worker to process the job submission.
					await OnTask( task_object );

					// Acknowledge successful processing of this
					// message to the message queue.
					await channel.ack( QueueMessage );
				}
				catch ( error ) 
				{
					// Print the error.
					console.error( error );

					// Tell the message queue that the message
					// was not processed and to requeue the message.
					await channel.nack( QueueMessage, false, true );
				}

				// Return.
				return;
			} );

		// Return.
		console.log( `[s-${process.pid}] Subscribed to submissions for job type '${TaskType}'.` );
		return channel;
	};
