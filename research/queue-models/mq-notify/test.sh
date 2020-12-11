#!/bin/bash

node ./src/mq-notify/service.js ABC 0.0 &
node ./src/mq-notify/service.js ABC 0.0 &
# node ./src/mq-notify/service.js DEF 0.0 &

# echo "Waiting for services to initialize ..."
sleep 2

node ./src/mq-notify/client.js BAD 2
node ./src/mq-notify/client.js ABC 10

echo "(Ctrl+C to exit)"
wait
