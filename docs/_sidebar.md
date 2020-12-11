<!-- _sidebar.md -->

<hr>

- lib-mrpc Docs

	- [Getting Started](external/readme.md)
	- [About lib-mrpc](guides/lib-mrpc.md)

<hr>

- Library API

	- [ServiceProvider](api/ServiceProvider.md)

	- In-Process Service Providers

		- [ImmediateServiceProvider](api/in-process/ImmediateServiceProvider.md)
		- [DeferredServiceProvider](api/in-process/DeferredServiceProvider.md)
		- [WorkerThreadServiceProvider](api/in-process/WorkerThreadServiceProvider.md)

	- Local Service Providers

		- [FSWatchServiceProvider](api/local/FSWatchServiceProvider.md)

	- Remote Service Providers

		- General Pub/Sub

			- [MongoDBServiceProvider](api/remote/general-pubsub/MongoDBServiceProvider.md)
			- [RedisServiceProvider](api/remote/general-pubsub/RedisServiceProvider.md)

		- Message Queues

			- [AmqpLibServiceProvider](api/remote/message-queue/AmqpLibServiceProvider.md)
			- [StompitServiceProvider](api/remote/message-queue/StompitServiceProvider.md)
			- [TortoiseServiceProvider](api/remote/message-queue/TortoiseServiceProvider.md)
		
<hr>

- Information

	- [Testing Output](external/testing-output.md)
	- [Software License](external/license.md)
