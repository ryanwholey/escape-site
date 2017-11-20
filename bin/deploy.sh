#!/bin/bash

#npm install
npm run build
export DB_PORT=2000
export PORT=4000

node_modules/.bin/forever start --uid "rw-escape-db" -a server/dbServer.js
node_modules/.bin/forever start --uid "rw-escape-app" -a server/server.js

