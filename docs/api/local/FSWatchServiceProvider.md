
# FSWatchServiceProvider


## Overview

Uses Node's native `fs` library to watch a specific directory for command and reply files
created as a result of invoking `CallEndpoint()`.

This implementation is subject to the same caveats as found in the `fs` library:
[Nodejs FS Library Caveats] (https://nodejs.org/docs/latest/api/fs.html#fs_caveats)


## Installation


## Usage

### Creating Objects

### Simple Usage


## Options

***Default Options***
```javascript
{
	path: LIB_OS.tmpdir(),
}
```

## Implementation


## Notes

