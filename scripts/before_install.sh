#!/bin/bash
sudo apt-get -y update
cd /home/ubuntu/test-deploy
git checkout main
git pull
