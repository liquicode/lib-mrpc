'use strict';


app.controller(
	'main_controller',
	function ( $scope, $http, $window, $location )
	{

		$scope.doc = null;
		$scope.sections = null;
		$scope.page = null;
		$scope.service_error = '';


		//=====================================================================
		$scope.select_page =
			function select_page( PageName )
			{
				$scope.page = null;
				if ( PageName === 'home' )
				{
					$scope.page = {
						name: "Home",
						sections: [ $scope.doc.Home ],
					};
				}
				else if ( PageName === 'Reference/Objects' )
				{
					$scope.page = {
						name: "Reference: Objects",
						sections: $scope.doc.Reference.Objects,
					};
				}
				else if ( PageName === 'Reference/Functions' )
				{
					$scope.page = {
						name: "Reference: Functions",
						sections: $scope.doc.Reference.Functions,
					};
				}
				else if ( PageName === 'Reference/Constants' )
				{
					$scope.page = {
						name: "Reference: Constants",
						sections: $scope.doc.Reference.Constants,
					};
				}
				else if ( PageName.startsWith( 'Docs/' ) )
				{
					let category_name = PageName.substr( 5 );
					let category = $scope.doc.Categories.find( category => category.name === category_name );
					if ( !category ) { return; }
					$scope.page = {
						name: category.name,
						sections: [],
					};
					$scope.page.sections.push( ...category.Narratives );
					$scope.page.sections.push( ...category.Objects );
					$scope.page.sections.push( ...category.Functions );
					$scope.page.sections.push( ...category.Constants );
				}
				return;
			};


		//=====================================================================
		function build_document( sections )
		{
			// Sort the sections by name.
			sections.sort( ( A, B ) => ( '' + A.name ).localeCompare( '' + B.name ) );

			// Initialize the document.
			let doc =
			{
				Home: null,
				Categories: [],
				Reference:
				{
					Objects: [],
					Functions: [],
					Constants: [],
				},
			};

			// Function to find or create a category.
			function find_category( Doc, CategoryName )
			{
				let category = Doc.Categories.find( category => category.name === CategoryName );
				if ( !category )
				{
					category = {
						name: CategoryName,
						Narratives: [],
						Objects: [],
						Functions: [],
						Constants: [],
					};
					Doc.Categories.push( category );
				}
				return category;
			}

			// Iterate through the sections and build the document.
			sections.forEach(
				section => 
				{
					if ( section.type === 'home' )
					{
						doc.Home = section;
					}
					else
					{
						let category = find_category( doc, section.category );
						if ( section.type === 'narrative' )
						{
							category.Narratives.push( section );
						}
						else if ( section.type === 'object' )
						{
							category.Objects.push( section );
							doc.Reference.Objects.push( section );
						}
						else if ( section.type === 'function' )
						{
							category.Functions.push( section );
							doc.Reference.Functions.push( section );
						}
						else if ( section.type === 'constant' )
						{
							category.Constants.push( section );
							doc.Reference.Constants.push( section );
						}
					}
					if ( section.description )
					{
						section.description = section.description.trim();
					}

				} );

			// Sort the category names.
			doc.Categories.sort( ( A, B ) => ( '' + A.name ).localeCompare( '' + B.name ) );

			// Return, OK.
			$scope.doc = doc;
			return;
		}



		//=====================================================================
		try
		{
			$http( {
				url: `/lib-mrpc.json`,
				method: 'GET',
				headers: { 'Accept': 'application/json' },
				params: {}
			} )
				.then(
					function ( response )
					{
						build_document( response.data );
						$scope.select_page( 'home' );
						return;
					},
					function ( error )
					{
						$scope.service_error = error.message;
						return;
					}
				);
		}
		catch ( error ) { }


		//------------------------------------------
		//	Exit Controller
		//------------------------------------------

		return;
	} );
