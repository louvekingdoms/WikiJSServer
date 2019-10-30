#!/bin/sh
name="wiki"
if [ "$#" -ne 0 ]; then
    name="$1"
fi
echo "Stopping $name"
node_modules/.bin/pm2 stop server/index.js --name $name
