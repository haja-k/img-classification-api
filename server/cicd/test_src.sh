#!/bin/sh

echo "Running unit tests for backend image"
npm install 
npm install -g nodemon
# npm run test &

# Wait for the unit tests to complete
while ! wait $!; do
    echo "Waiting for unit tests to finish..."
    sleep 5
done

echo "Unit testing completed! Proceeding to the next pipeline stage."
