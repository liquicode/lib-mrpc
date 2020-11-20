#!/bin/bash


#####################################################################
##
##		Update Docs
##
#####################################################################

cp ./readme.md ./docs/guides/readme.md
cp ./src/lib-mrpc.md ./docs/guides/lib-mrpc.md
cp ./src/ServiceProvider.md ./docs/guides/ServiceProvider.md

cp ./src/ImmediateServiceProvider.md ./docs/guides/ImmediateServiceProvider.md
cp ./src/DeferredServiceProvider.md ./docs/guides/DeferredServiceProvider.md
cp ./src/WorkerThreadServiceProvider.md ./docs/guides/WorkerThreadServiceProvider.md

cp ./src/FSWatchServiceProvider.md ./docs/guides/FSWatchServiceProvider.md

cp ./src/AmqpLibServiceProvider.md ./docs/guides/AmqpLibServiceProvider.md
cp ./src/StompServiceProvider.md ./docs/guides/StompServiceProvider.md
cp ./src/TortoiseServiceProvider.md ./docs/guides/TortoiseServiceProvider.md
cp ./src/RedisServiceProvider.md ./docs/guides/RedisServiceProvider.md


#####################################################################
##
##		Build Library
##
#####################################################################

npx webpack-cli --config build/__secrets/webpack.config.js
