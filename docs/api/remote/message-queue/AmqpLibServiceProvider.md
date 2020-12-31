
# AmqpLibServiceProvider

A `ServiceProvider` for message brokers supporting the `amqp` protocol.


## Overview

Service `Endpoints` are invoked remotely via a message broker supporting the [amqp] v0.9.1 protocol.
Requires the [amqplib/amqp.node](https://github.com/squaremo/amqp.node) third-party library.
Tested with [RabbitMQ](https://www.rabbitmq.com/).


***Amqp Message Brokers***
- RabbitMQ
- Kafka
- IBM MQ
- ActiveMQ
- RocketMQ
- Qpid


### AmqpLibServiceProvider Options

***Default Options***
```javascript
{
	server: 'amqp://guest:guest@localhost:5672',
	connect_options:
	{
		connectRetries: 30,
		connectRetryInterval: 1000,
	},
	command_queue_options:
	{
		exclusive: false,
		durable: false,
		autoDelete: true,
	},
	reply_queue_options:
	{
		exclusive: true,
		durable: false,
		autoDelete: true,
	},
}
```


## Resources

- [amqplib/amqp.node library](https://github.com/squaremo/amqp.node)
- [amqplib/amqp.node documentation](https://www.squaremobius.net/amqp.node/channel_api.html#overview)
- [amqp protocol](https://www.amqp.org)
- [RabbitMQ](https://www.rabbitmq.com)
