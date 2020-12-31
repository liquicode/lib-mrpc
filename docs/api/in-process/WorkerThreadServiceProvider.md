
# WorkerThreadServiceProvider

## Overview


## Installation


## Usage

### Creating Objects

### Simple Usage


## Options

***Default Options***
```javascript
{
	max_threads: 10,
}
```

## Implementation


## Notes

- Requires `Node.js v12 LTS`
- Can be used with `Node.js v10.5.0`, but requires Node to be run with the `--experimental-worker` flag.
- There are certain restrictions to code running in a Worker,
	see: https://nodejs.org/docs/latest-v12.x/api/worker_threads.html#worker_threads_class_worker
- There are certain restrictions to the CommandParameters passed to code running in a Worker,
	see: https://nodejs.org/docs/latest-v12.x/api/worker_threads.html#worker_threads_port_postmessage_value_transferlist
- Limitations:
	- Endpoint functions cannot `require` any libraries/packages.
	- Endpoint functions cannot be `async`.
- References:
	- https://nodejs.org/docs/latest-v12.x/api/worker_threads.html
	- https://blog.logrocket.com/node-js-multithreading-what-are-worker-threads-and-why-do-they-matter-48ab102f8b10/
	- https://blog.logrocket.com/a-complete-guide-to-threads-in-node-js-4fa3898fe74f/
	- https://www.freecodecamp.org/news/how-to-limit-concurrent-operations-in-javascript-b57d7b80d573/


