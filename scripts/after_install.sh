#!/bin/bash
cd /home/ec2-user/test-deploy
npm install
sudo pm2 restart app.js
