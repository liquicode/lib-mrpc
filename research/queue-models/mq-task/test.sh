#!/bin/bash

node ./src/mq-task/service.js XYZ 0.0 &
node ./src/mq-task/service.js XYZ 0.2 &

echo "Waiting for services to initialize ..."
sleep 1

# node ./src/mq-task/client.js BAD 1
node ./src/mq-task/client.js XYZ 5

echo "(Ctrl+C to exit)"
wait
