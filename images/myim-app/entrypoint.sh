#!/bin/sh

echo $NODE_ENV

if [ "$NODE_ENV" != "production" ]; then
    echo "Development mode:"
    sleep infinity
else
    # Wait for files in the specified directory
    while [ ! -f /certs/* ]; do
        echo "Waiting for files in /cert..."
        sleep 1
    done

    echo "Files found! Starting the server..."
    node ./bin/www.js
fi
