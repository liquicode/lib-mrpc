'use strict';

exports.NewEndpoints =
	function NewEndpoints()
	{
		let endpoints =
		{
			Endpoints: {},

			EndpointExists:
				function EndpointExists( EndpointName )
				{
					return ( typeof this.Endpoints[ EndpointName ] !== 'undefined' );
				},

			AddEndpoint:
				function AddEndpoint( EndpointName, Handler )
				{
					let endpoint =
					{
						EndpointName: EndpointName,
						Handler: Handler,
					};
					this.Endpoints[ EndpointName ] = endpoint;
					return endpoint;
				},

			RemoveEndpoint:
				function RemoveEndpoint( EndpointName )
				{
					if ( this.EndpointExists( EndpointName ) )
					{
						delete this.Endpoints[ EndpointName ];
					}
					return;
				},

			HandleEndpoint:
				async function HandleEndpoint( EndpointName, Parameters )
				{
					if ( this.EndpointExists( EndpointName ) )
					{
						return await this.Endpoints[ EndpointName ].Handler( Parameters );
					}
					return;
				},
		};
		return endpoints;
	};
