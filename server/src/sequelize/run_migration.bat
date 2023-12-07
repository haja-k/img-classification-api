@echo off

REM Undo migrations
node -e "require('child_process').execSync('npx sequelize-cli db:migrate:undo:all --config \"config.js\" --env \"local\"', { stdio: 'inherit' });"

REM Apply migrations
node -e "require('child_process').execSync('npx sequelize-cli db:migrate --config \"config.js\" --env \"local\"', { stdio: 'inherit' });"

REM Generate seed file
node -e "require('child_process').execSync('npx sequelize-cli db:seed --seed 20230807062528-init.js --config \"config.js\" --env "local"', { stdio: 'inherit' });"

echo All commands completed.
pause
