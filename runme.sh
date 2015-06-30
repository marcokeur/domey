#!/bin/sh
echo "Setting IPtables rule"
sudo iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 80 -j REDIRECT --to-port 3000
echo "Running connector in screen"
cd connector
screen -dm -S connector node app.js
cd ..

cd dashboard
echo "Running dashboard in screen"
screen -dm -S dashboard node app.js
cd ..