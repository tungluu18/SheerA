#!/bin/bash
cp .env .env.production
npm run build
cp -r build/* /var/www/SheerA
systemctl restart nginx
