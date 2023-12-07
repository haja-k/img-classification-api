#!/bin/bash

npm i -g npx
npm install sequelize --save
npm install -g sequelize-cli

# Echo the value of the NODE_ENV variable
echo "NODE_ENV is set to: ${NODE_ENV}"

# Change directory to src/sequelize
cd src/sequelize

# Undo migrations
npx sequelize-cli db:migrate:undo:all --config ./config.js --env ${NODE_ENV}

# Apply migrations
npx sequelize-cli db:migrate --config ./config.js --env ${NODE_ENV}

# Generate seed file
npx sequelize-cli db:seed --seed 20230807062528-init.js --config ./config.js --env ${NODE_ENV}

# Return to the original directory
cd -