#!/bin/bash
cd /home/ubuntu/test-deploy
npm install
sudo pm2 restart app.js
