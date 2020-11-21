"use strict";


const LIB_MRPC = require( '../src/lib-mrpc.js' );
const LIB_TORTOISE = require( '../src/TortoiseServiceProvider.js' );
const LIB_ASSERT = require( 'assert' );

var TestService = null;
var TestClient = null;

//---------------------------------------------------------------------
describe( `42) Tortoise Tests`,
	function ()
	{

		//---------------------------------------------------------------------
		beforeEach(
			async function ()
			{
				TestService = LIB_TORTOISE.TortoiseServiceProvider( 'Test Service' );
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
