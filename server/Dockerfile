FROM node:18-alpine as base
COPY ./ /app
WORKDIR /app

RUN apk --no-cache add curl && \
    npm install && \
    npm install -g nodemon

WORKDIR /app/src/sequelize
# RUN chmod +x run_migration_dev.bat

EXPOSE 4000
CMD npm run dev
