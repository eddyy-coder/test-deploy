#!/bin/bash
sudo apt-get -y update
cd /home/ec2-user/test-deploy
git checkout main
git pull
