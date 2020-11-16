#!/bin/bash

docker run -d --hostname test-rabbitmq --name test-rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management
