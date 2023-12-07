#!/bin/bash

# Undo migrations
npx sequelize-cli db:migrate:undo:all --config ./config.js --env ${NODE_ENV}

# Apply migrations
npx sequelize-cli db:migrate --config ./config.js --env ${NODE_ENV}

# Generate seed file
npx sequelize-cli db:seed --seed 20230807062528-init.js --config ./config.js --env ${NODE_ENV}
