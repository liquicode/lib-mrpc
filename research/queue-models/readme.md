
# Implementation of various queue models and messaging patterns

This package contains sample code written in NodeJS to demonstrate the construction and usage of message queues.
Specifically, two types of message queues are constructed:

- Notify: When a client publishes to the Notify queue, that message is delivered to ALL connected subscribers.
- Task: When a client publishes to the Task queue, that message is delivered to only ONE of the connected subscribers.


## Technologies Used

### RabbitMQ

This sample uses a locally running `rabbitmq` as the message queue server.

***Running a Docker instance of rabbitmq***

This command runs a Docker instance of `rabbitmq` on your local machine, listening on port 5672.
It also runs the web management interface for `rabbitmq` on port 15672.

```bash
docker run -d --hostname test-rabbitmq --name test-rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management
```

No further configuration of `rabbitmq` is required.
The web management interface can be accessed at http://localhost:15672 with a login of guest/guest.


### NPM Package amqplib

This sample uses npm package `amqplib` to communicate with an amqp v0.9.1 compliant message queue server.

```bash
npm install --save amqplib
```


## Notify Queue

The notification queue is a single exchange that publishers can send messages to and where
	many subscribers can receive those messages in exclusive temporary queues bound to
	the notification exchange.

A `fanout` exchange takes any message sent to it and broadcasts it to all queues which are 
	bound to that exchange.
In `rabbitmq` a default `fanout` exchange exists called `amq.fanout`.
A subscriber creates a new temporary queue and binds it to this `fanout` exchange.
Publishers send messages directly to the `fanout` exchange.

The notify queue has the following features:
- Each subscriber processes only one message at a time.
- Each message is processed by all connected subscribers.
- When an error occurs while processing a message by a subscriber, that message is ignored.
- When a subscriber disconnects and there are no messages left in its queue, that queue is deleted.
- The subscriber queues are not durable and messages will not survive a message queue restart.

Source code for the samples are found in `src/mq-notify`

The test for this queue can be found here `src/mq-notify/test.sh`


## Task Queue

The task queue is a single queue that can have many publishers and many subscribers.

The task queue has the following features:
- Each subscriber processes only one message at a time.
- Each message is processed by only one subscriber.
- When an error occurs while processing a message by a subscriber, that message is requeued.
- When there are no messages in the queue and there are no connected publishers or subscribers,
	then the queue is deleted.
- The queue is durable and messages in the queue will survive a message queue restart.

Source code for the samples are found in `src/mq-task`

The test for this queue can be found here `src/mq-task/test.sh`
