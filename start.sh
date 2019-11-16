#!/bin/sh

name="wiki"

if [ "$#" -ne 0 ]; then
    name="$1"
fi
echo "Starting $name"

node_modules/.bin/pm2 restart server/index.js --name $name
