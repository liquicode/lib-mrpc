/*
### mq-notify

This module provides functions to `publish` and `subcribe` to a notification queue.

The notification queue is a single exchange that publishers can send messages to and where
	many subscribers can receive those messages in exclusive temporary queues bound to
	the notification exchange.

A `fanout` exchange takes any message sent to it and broadcasts it to all queues which are 
	bound to that exchange.
In `rabbitmq` a default `fanout` exchange exists called `amq.fanout`.
A subscriber creates a new temporary queue and binds it to this `fanout` exchange.
Publishers send messages directly to the `fanout` exchange.

The configuration has the following features:
- Each subscriber processes only one message at a time.
- Each message is processed by all connected subscribers.
- When an error occurs while processing a message by a subscriber, that message is ignored.
- When a subscriber disconnects and there are no messages left in its queue, that queue is deleted.
- The subscriber queues are not durable and messages will not survive a message queue restart.

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
	exclusive: true,
	durable: false,
	autoDelete: true,
};
const MQ_MESSAGE_OPTIONS =
{
	contentType: "text/plain",
	deliveryMode: true,
	persistent: false,
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
		let amqp_client = await LIB_AMQPLIB.connect( MQ_SERVER, MQ_SERVER_OPTIONS );

		// Send notification message to the message queue.
		let channel = await amqp_client.createChannel();
		let result = null;
		result = await channel.assertExchange( 'amq.fanout', 'fanout', MQ_EXCHANGE_OPTIONS );
		result = await channel.publish( 'amq.fanout', DatasetType, Buffer.from( message ) );
		await channel.close();

		// Return.
		return;
	};


//---------------------------------------------------------------------
// Function to subcribe to notification messages and send them to a notification handler.
exports.subscribe =
	async function subscribe( DatasetType, OnNotification )
	{
		// Connect to the message queue.
		let amqp_client = await LIB_AMQPLIB.connect( MQ_SERVER, MQ_SERVER_OPTIONS );

		let channel = await amqp_client.createChannel();
		let result = null;
		let queue_name = null;
		result = await channel.assertExchange( 'amq.fanout', 'fanout', MQ_EXCHANGE_OPTIONS );
		result = await channel.assertQueue( '', MQ_QUEUE_OPTIONS );
		queue_name = result.queue;
		result = await channel.bindQueue( queue_name, 'amq.fanout', DatasetType );
		// result = await channel.prefetch( 1 );
		result = await channel.consume( queue_name,
			async ( QueueMessage ) =>
			{
				if ( !QueueMessage ) { return; }
				let message = QueueMessage.content.toString();
				let notification_object = JSON.parse( message );

				// Process the message.
				try 
				{
					// Call the worker to process the notification.
					await OnNotification( notification_object );

					// Acknowledge successful processing of this
					// message to the message queue.
					await channel.ack( QueueMessage );
				}
				catch ( error ) 
				{
					// Print the error.
					console.error( error );

					// Tell the message queue that the message
					// was not processed and to not requeue the message.
					await channel.nack( QueueMessage, false, false );
				}

				// Return.
				return;
			} );

		// Return.
		console.log( `[s-${process.pid}] Subscribed to '${DatasetType}' change notifications.` );
		return channel;
	};
