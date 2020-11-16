"use strict";


const LIB_MRPC = require( '../src/lib-mrpc.js' );
const LIB_TORTOISE = require( '../src/TortoiseServiceProvider.js' );
const LIB_ASSERT = require( 'assert' );

var TestService = null;
var TestClient = null;

//---------------------------------------------------------------------
describe( `52) Tortoise Tests`,
	function ()
	{

		//---------------------------------------------------------------------
		beforeEach(
			async function ()
			{
				let options =
				{
					server: 'amqp://guest:guest@localhost:5672',
					connect_options:
					{
						connectRetries: 30,
						connectRetryInterval: 1000,
					},
				};
				TestService = LIB_TORTOISE.TortoiseServiceProvider( 'Test Service', options );
				await TestService.OpenPort();
				// For remote ServiceProviders, client and service may share the same instance.
				TestClient = TestService;
				return;
			} );


		//---------------------------------------------------------------------
		afterEach(
			async function ()
			{
				await TestService.ClosePort();
				TestService = null;
				TestClient = null;
				return;
			} );


		//---------------------------------------------------------------------
		it( `Echo Service`,
			async function ()
			{
				let {
					install_service_endpoints,
					run_tests,
				} = require( './services/echo.js' );
				await install_service_endpoints( TestService );
				await run_tests( TestClient, { iterations: 100 } );
				return;
			} );


	} );
