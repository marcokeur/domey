#!/bin/sh
echo "Doing git pull"
git pull

echo "Setting IPtables rule"
sudo iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 80 -j REDIRECT --to-port 3000

echo "Running framework in screen"
npm install --production
screen -dm -S framework node app.js
