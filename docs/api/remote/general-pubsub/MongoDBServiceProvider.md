
# MongoDBServiceProvider


### Overview

MongoDB is popular NoSql database.

`lib-mrpc` utilizes the `mongodb` pub/sub functions to route commands and replies between
client and server instances of a `MongoDBServiceProvider` object.

- You can read more about the mongodb here: [mongodb server](http://www.mongodb.org/)
- Code and documentation for the mongodb npm package is here: [mongodb client](https://www.npmjs.com/package/mongodb)


### Installation

This `ServiceProvider` is included in the `@liquicode/lib-mrpc` package:
```bash
npm install --save @liquicode/lib-mrpc
```

The `MongoDBServiceProvider` type also requires that you have the `mongodb` client library installed:
```bash
npm install --save mongodb
```

If you also need a mongodb server to test/develop with, you can easily use docker to get one started:
```bash
docker run -d -p 27017:27017 mongo
```
This will download and start a mongodb server on your machine (listening at port 27017).

- For information on docker, see here: [docker](https://www.docker.com/)
- The docker mongodb image is here: [docker mongodb](https://hub.docker.com/_/mongo)


### Usage

### Creating MongoDBServiceProvider Objects

A new `MongoDBServiceProvider` object can be created by gaining a reference to the `lib-mrpc` library
and calling the `MongoDBServiceProvider()` factory function:
```javascript
const lib_mrpc = require( '@liquicode/lib-mrpc' );
let service = lib_mrpc.MongoDBServiceProvider( 'My Service' );
```

The `MongoDBServiceProvider()` factory function takes a name for the service as the first
parameter and an optional `Options` object in the second parameter.


### Simple Usage

```javascript
// Gain a reference to the ServiceProvider constructor function.
const lib_mrpc = require( '@liquicode/lib-mrpc' );
// Create a new instance of the ServiceProvider (uses default connection values).
let service = lib_mrpc.MongoDBServiceProvider( 'My Service', { enable_service: true } );
// Connect to the message broker (e.g. RabbitMQ server).
await service.OpenPort();
// Add some endpoints to our service.
await service.AddEndpoint( 'echo', Request => Request );
await service.AddEndpoint( 'sum', function ( Request ) { return Request.arg1 + Request.arg2 } );
// Call our endpoints.
await service.CallEndpoint( 'echo', "Hello World!", function ( Reply ) { console.log( Reply ); } );
await service.CallEndpoint( 'sum', { arg1: 5, arg2: 4 }, function ( Reply ) { console.log( Reply ); } );
// Shutdown.
await service.ClosePort();
```


### MongoDBServiceProvider Options

***Default Options***
```javascript
{
	url: 'redis://localhost:6379',
	options: {},
	enable_service: false,
}
```

- `url` and `options` parameters specified here:
[http://mongodb.github.io/node-mongodb-native/3.6/api/MongoClient.html#.connect](http://mongodb.github.io/node-mongodb-native/3.6/api/MongoClient.html#.connect)
- `enable_service`:
	If `true`, then `MongoDBServiceProvider` will listen for commands being routed through the mongo database.
	Otherwise, onlu client functionality will beavailable.


The `MongoDBServiceProvider` takes advantage of MongoDB's [Tailable Cursors](https://docs.mongodb.com/manual/core/tailable-cursors/) feature.


### Implementation

The `MongoDBServiceProvider` object implements all of the `ServiceProvider` methods.

- `async function OpenPort()`
	- Establishes a connection to the mongodb database.
	- When `Options.enable_service === true`:
		- Creates a capped collection for the service.
		- Starts a tailable cursor on the capped collection to begin listening for service requests.
	- When `Options.enable_service !== true`:
		- Does nothing interesting. Just returns success.
- `async function ClosePort()`
	- When `Options.enable_service === true`:
		- Deletes capped collection and disconnects from the database.
	- When `Options.enable_service !== true`:
		- Does nothing interesting. Just returns success.
- `async function AddEndpoint( EndpointName, CommandFunction )`
	- Adds `Endpoint` to the `Endpoints` array. (`enable_service` must be `true`)
- `async function CallEndpoint( EndpointName, CommandParameters, CommandCallback = null )`
	- Starts a tailable cursor on the capped collection to listen for a reply.
	- Insert the command into the capped collection.
	- The tailable cursor is shut down as soon as it receives a reply.


### Notes

- [MongoDB Connection String](https://docs.mongodb.org/manual/reference/connection-string)
- [MongoDB Tailable Cursors](https://docs.mongodb.com/manual/core/tailable-cursors/)
- [MongoDB Capped Collections](https://docs.mongodb.com/manual/core/capped-collections/)
- [Example of working with a tailable cursor on a capped collections in NodeJS and Mongo](https://gist.github.com/dolphin278/5445957)

