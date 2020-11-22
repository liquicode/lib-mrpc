#!/bin/bash

# Official RabbitMQ Image with Management Plugin
# docker run -d --hostname test-rabbitmq --name test-rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management

# RabbitMQ Image with Management and Stomp Plugins
docker run -d --hostname test-rabbitmq --name test-rabbitmq -p 5672:5672 -p 61613:61613 -p 15672:15672 byteflair/rabbitmq-stomp
