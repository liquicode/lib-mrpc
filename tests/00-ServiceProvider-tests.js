"use strict";


const LIB_MRPC = require( '../src/lib-mrpc.js' );
const LIB_SERVICE_PROVIDER = require( '../src/ServiceProvider.js' );
const LIB_ASSERT = require( 'assert' );

var TestService = null;

//---------------------------------------------------------------------
describe( `00) ServiceProvider Tests`,
	function ()
	{

		//---------------------------------------------------------------------
		beforeEach(
			function ()
			{
				TestService = LIB_SERVICE_PROVIDER.ServiceProvider( 'Test Service' );
				return;
			} );


		//---------------------------------------------------------------------
		afterEach(
			function ()
			{
				TestService = null;
				return;
			} );


		//---------------------------------------------------------------------
		it( `Generates Unique IDs`,
			function ()
			{
				for ( let index = 0; index < 10; index++ )
				{
					let id = TestService.UniqueID();
					// console.log( `${index + 1}\t${id}` );
				}
				return;
			} );


	} );
