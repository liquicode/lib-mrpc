
# Notes


## TODO

- Develop a `ServiceTransaction` object.
	- `StartTransaction`: Begin aggregating calls to `Endpoint`s.
	- `CommitTransaction`: Execute aggregated calls to `Endpoint`s.
	- `RollbackTransaction`: Use `Undo` data to undo the effects of all service calls.
- `WorkerThreadServiceProvider`:
	- Use a thread pool so it doesn't just blindly consume all of the resources anyway.
- Develop a mechanism to provide schema information for parameters and return values.
	- Used for validation.
	- Used for documentation.
	- Used for testing?


## Planned Service Provider Implementations


### Local Service Provders

- `CommandLineServiceProvider`: (***Not Implemented***)

- `ClusterServiceProvider`: (***Not Implemented***)

- `ChildProcessServiceProvider`: (***Not Implemented***)

### Remote Service Provders

***Web Sockets***

- `HttpGetServiceProvider`: (***Not Implemented***)

- `HttpPostServiceProvider`: (***Not Implemented***)

- `SocketIOServiceProvider`: (***Not Implemented***)

***Message Queues***

- `StompitServiceProvider` : (***Unfinished, Currently Not Working***)

- `ZeroMQServiceProvider` : (***Not Implemented***)
	- [zeromq server](https://zeromq.org/)
	- [zeromq docker image](https://hub.docker.com/r/zeromq/zeromq/)
	- [zeromq client npm](https://www.npmjs.com/package/zeromq)
	- [zeromq client code](https://github.com/zeromq/zeromq.js)

***General Pub/Sub***

- `MongoDBServiceProvider` : (***Not Implemented***)
	- [mongodb server](https://www.mongodb.com/)
	- [mongodb docker image](https://hub.docker.com/_/mongo)
	- [mongodb client npm](https://www.npmjs.com/package/mongodb)
	- [mongodb client code](https://github.com/mongodb/node-mongodb-native)

- `KafkaServiceProvider` : (***Not Implemented***)
	- [kafka server](https://kafka.apache.org/)
	- [kafka docker image](https://hub.docker.com/r/spotify/kafka)
	- [kafka client npm](https://www.npmjs.com/package/kafka-node)


## Resources / References

***Generators***

- [Yield! Yield! How Generators work in JavaScript.](https://www.freecodecamp.org/news/yield-yield-how-generators-work-in-javascript-3086742684fc/)
- [Trying to understand generators / yield in node.js - what executes the asynchronous function?](https://stackoverflow.com/questions/17516952/trying-to-understand-generators-yield-in-node-js-what-executes-the-asynchron)
- [A Study on Solving Callbacks with JavaScript Generators](https://jlongster.com/A-Study-on-Solving-Callbacks-with-JavaScript-Generators)
- [A Closer Look at Generators Without Promises](https://jlongster.com/A-Closer-Look-at-Generators-Without-Promises)

***CSP Channels***

- [Taming the Asynchronous Beast with CSP Channels in JavaScript](https://jlongster.com/Taming-the-Asynchronous-Beast-with-CSP-in-JavaScript)


