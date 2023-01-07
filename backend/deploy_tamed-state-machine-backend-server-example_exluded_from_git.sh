cicd.sh tamed-state-machine-backend-server-example "/Users/mehmetkaplan/OneDrive - Computatus/SharedFolder/Lightsail/LightsailDefaultKey-us-east-2.pem"   "ubuntu@development.computatus.com"
echo -e "\x1b[1;33m\n\n\nRun following on server:

\x1b[0;32m
cd ~/tamed-state-machine-backend-server-example
rm -rf node_modules
yarn
node tamed-state-machine-backend-server-example
\x1b[0m
"
