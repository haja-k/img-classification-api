#!/bin/sh

echo "Building bleeding backend image"
npm install 
npm install -g nodemon
npm run . &

# Check if the server is up before proceeding (only if Redis is needed)
if [[ $USE_REDIS == "true" ]]; then
    while ! curl -s http://localhost:4000 > /dev/null; do
        echo "Waiting for the server to start..."
        sleep 5
    done

    echo "Server is up and running! Proceeding to the next pipeline stage."
else
    echo "Skipping server start check since Redis is not needed."
fi

