"use strict";


const LIB_MRPC = require( '../src/lib-mrpc.js' );
const LIB_WORKER_THREAD = require( '../src/FSWatchServiceProvider.js' );
const LIB_ASSERT = require( 'assert' );

var TestService = null;
var TestClient = null;

//---------------------------------------------------------------------
describe( `21) FSWatch Tests`,
	function ()
	{

		//---------------------------------------------------------------------
		beforeEach(
			async function ()
			{
				let options = { path: 'tests/~temp' };
				TestService = LIB_WORKER_THREAD.FSWatchServiceProvider( 'Test Service', options );
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
				await run_tests( TestClient, { iterations: 10000 } );
				return;
			} );


	} );
