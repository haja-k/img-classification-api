#!/bin/sh

echo "Running linting for backend image"
npm install 
npm install -g nodemon

# Run linting and capture the exit code
npm run lint
lint_exit_code=$?

# Check if linting exited with a non-zero code
if [ $lint_exit_code -ne 0 ]; then
    echo "Linting failed! Exiting..."
    exit $lint_exit_code
fi

echo "Linting completed! Proceeding to the next pipeline stage."