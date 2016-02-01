#!/bin/sh
set -e
#set variables
PROJECT_VERSION="${BUILD_NUMBER}"

cd ${WORKSPACE}/

#update code
rsync -L -a -d -r --ignore-errors --delete --force \
${WORKSPACE}/ ${PROJECT_HOST_PATH}

sudo /etc/init.d/nodejs stop
sudo /etc/init.d/nodejs start