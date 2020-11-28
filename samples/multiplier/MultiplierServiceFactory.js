'use strict';


const LIB_MRPC = require( '../src/lib-mrpc.js' );

const MULTIPLIER_SERVICE_NAME = 'test.multiplier';


//=====================================================================
//=====================================================================
//
//		Multiplier : The Multiply Function
//
//=====================================================================
//=====================================================================


function multiply_function( CommandParameters )
{
	CommandParameters.result = CommandParameters.arg1 * CommandParameters.arg2;
	return CommandParameters;
}


//=====================================================================
//=====================================================================
//
//		Multiplier : Immediate Service
//
//=====================================================================
//=====================================================================

exports.ImmediateMultiplierService =
	async () =>
	{
		//---------------------------------------------------------------------
		// Create the Multiplier service.
		let service = await LIB_MRPC.ImmediateServiceProvider( MULTIPLIER_SERVICE_NAME );

		//---------------------------------------------------------------------
		// Activate the Multiplier service.
		service.OpenPort();

		//---------------------------------------------------------------------
		// Register the Multiplier handler
		await service.AddEndpoint( 'Multiply', multiply_function );

		//---------------------------------------------------------------------
		// Return the Multiplier service.
		return service;
	};


//=====================================================================
//=====================================================================
//
//		Multiplier : Deferred Service
//
//=====================================================================
//=====================================================================

exports.DeferredMultiplierService =
	async () =>
	{
		//---------------------------------------------------------------------
		// Create the Multiplier service.
		let service = await LIB_MRPC.DeferredServiceProvider( MULTIPLIER_SERVICE_NAME );

		//---------------------------------------------------------------------
		// Activate the Multiplier service.
		service.OpenPort();

		//---------------------------------------------------------------------
		// Register the Multiplier handler
		await service.AddEndpoint( 'Multiply', multiply_function );

		//---------------------------------------------------------------------
		// Return the Multiplier service.
		return service;
	};


//=====================================================================
//=====================================================================
//
//		Multiplier : Worker Thread Service
//
//=====================================================================
//=====================================================================

exports.WorkerThreadMultiplierService =
	async () =>
	{
		//---------------------------------------------------------------------
		// Create the Multiplier service.
		let service = await LIB_MRPC.WorkerThreadServiceProvider( MULTIPLIER_SERVICE_NAME );

		//---------------------------------------------------------------------
		// Activate the Multiplier service.
		service.OpenPort();

		//---------------------------------------------------------------------
		// Register the Multiplier handler
		await service.AddEndpoint( 'Multiply', multiply_function );

		//---------------------------------------------------------------------
		// Return the Multiplier service.
		return service;
	};


//=====================================================================
//=====================================================================
//
//		Multiplier : Stomp Service
//
//=====================================================================
//=====================================================================

exports.StompMultiplierService =
	async () =>
	{
		//---------------------------------------------------------------------
		// Create the Multiplier service.
		let service = await LIB_MRPC.StompServiceProvider(
			MULTIPLIER_SERVICE_NAME,
			{
				host: 'localhost',
				port: 61613,
				connectHeaders:
				{
					host: '/',
					login: 'guest',
					passcode: 'guest',
					'heart-beat': '5000,5000',
				}
			},
		);

		//---------------------------------------------------------------------
		// Activate the Multiplier service.
		await service.OpenPort();

		//---------------------------------------------------------------------
		// Register the Multiplier handler
		await service.AddEndpoint( 'Multiply', multiply_function );

		//---------------------------------------------------------------------
		// Return the Multiplier service.
		return service;
	};


//=====================================================================
//=====================================================================
//
//		Multiplier : Tortoise Service
//
//=====================================================================
//=====================================================================

exports.TortoiseMultiplierService =
	async () =>
	{
		//---------------------------------------------------------------------
		// Create the Multiplier service.
		let service = await LIB_MRPC.TortoiseServiceProvider(
			MULTIPLIER_SERVICE_NAME,
			{ server: 'amqp://localhost' },
		);

		//---------------------------------------------------------------------
		// Activate the Multiplier service.
		await service.OpenPort();

		//---------------------------------------------------------------------
		// Register the Multiplier handler
		await service.AddEndpoint( 'Multiply', multiply_function );

		//---------------------------------------------------------------------
		// Return the Multiplier service.
		return service;
	};


//=====================================================================
//=====================================================================
//
//		Multiplier : AmqpLib Service
//
//=====================================================================
//=====================================================================

exports.AmqpLibMultiplierService =
	async () =>
	{
		//---------------------------------------------------------------------
		// Create the Multiplier service.
		let service = await LIB_MRPC.AmqpLibServiceProvider(
			MULTIPLIER_SERVICE_NAME,
			{ server: 'amqp://localhost' },
		);

		//---------------------------------------------------------------------
		// Activate the Multiplier service.
		await service.OpenPort();

		//---------------------------------------------------------------------
		// Register the Multiplier handler
		await service.AddEndpoint( 'Multiply', multiply_function );

		//---------------------------------------------------------------------
		// Return the Multiplier service.
		return service;
	};


//=====================================================================
//=====================================================================
//
//		Multiplier : Redis Service
//
//=====================================================================
//=====================================================================

exports.RedisMultiplierService =
	async () =>
	{
		//---------------------------------------------------------------------
		// Create the Multiplier service.
		let service = await LIB_MRPC.RedisServiceProvider(
			MULTIPLIER_SERVICE_NAME,
			{ server: 'redis://localhost' },
		);

		//---------------------------------------------------------------------
		// Activate the Multiplier service.
		await service.OpenPort();

		//---------------------------------------------------------------------
		// Register the Multiplier handler
		await service.AddEndpoint( 'Multiply', multiply_function );

		//---------------------------------------------------------------------
		// Return the Multiplier service.
		return service;
	};


