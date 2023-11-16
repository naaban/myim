#!/bin/bash

# Source environment variables from .env file
source ./.env

# Check if $1 is either "up" or "down"
if [ "$1" != "up" ] && [ "$1" != "down" ]; then
    echo "Invalid argument. Usage: $0 [up|down]"
    exit 1
fi

# Set the Docker Compose command with arguments
docker compose -f docker-compose.yml -f docker-compose.$NODE_ENV.yml $1
