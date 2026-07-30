#!/bin/sh
set -e

# Railway - and any PaaS - injects configuration as process environment
# variables. The app's start scripts read configuration through
# `dotenv -e ../../.env`, and .env is gitignored so it never reaches the image.
# Without the file dotenv-cli exits and pm2 reports the process as "online"
# while nothing ever binds to :3000, which surfaces as a 502 from nginx.
# Materialise the file from the environment before anything starts.
node -e "
const fs = require('fs');
const lines = Object.entries(process.env)
  .filter(([k, v]) => /^[A-Za-z_][A-Za-z0-9_]*\$/.test(k) && typeof v === 'string')
  .map(([k, v]) => k + '=' + JSON.stringify(v));
fs.writeFileSync('/app/.env', lines.join('\n') + '\n');
console.log('wrote /app/.env with ' + lines.length + ' variables');
"

nginx
exec pnpm run pm2
