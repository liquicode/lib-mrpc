
# TortoiseServiceProvider

A `ServiceProvider` for message brokers supporting the `amqp` protocol.


## Overview

Service `Endpoints` are invoked remotely via a message broker supporting the [amqp] v0.9.1 protocol.
Requires the [tortoise](https://github.com/CompassPHS/tortoise) third-party library.
Tested with [RabbitMQ](https://www.rabbitmq.com/).


## Options

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
		exclusive: false,
		durable: false,
		autoDelete: true,
	},
}
```

## Installation



## Usage

### Simple Usage

```javascript
// Gain a reference to the ServiceProvider constructor function.
const TortoiseServiceProvider = require( 'lib-mrpc/TortoiseServiceProvider' ).TortoiseServiceProvider;
// Create a new instance of the ServiceProvider (uses default option values).
let service = new TortoiseServiceProvider( 'My Service' );
// Connect to the message broker (e.g. RabbitMQ server).
await service.OpenPort();
// Add some endpoints to our service.
await service.AddEndpoint( 'echo', Request => Request );
await service.AddEndpoint( 'sum', function ( Request ) { return Request.arg1 + Request.arg2 } );
// Call our endpoints.
await service.CallEndpoint( 'echo', "Hello World!", function ( Reply ) { console.log( Reply ); } );
await service.CallEndpoint( 'sum', { arg1: 5, arg2: 4 }, function ( Reply ) { console.log( Reply ); } );
```

## Resources

- [tortoise library](https://github.com/CompassPHS/tortoise)
- [tortoise documentation](https://github.com/CompassPHS/tortoise)
- [amqp protocol](https://www.amqp.org)
- [RabbitMQ](https://www.rabbitmq.com)

***Amqp Message Brokers***
- RabbitMQ
- Kafka
- IBM MQ
- ActiveMQ
- RocketMQ
- Qpid
