#!/usr/bin/env bash
set -euo pipefail

APP_USER="ubuntu"
APP_DIR="/home/ubuntu/global-meditation-tracker"
APP_NAME="global-meditation-tracker"

# ------------------------------
# If run as root → re-exec as ubuntu
# ------------------------------
if [ "$(id -un)" != "$APP_USER" ]; then
  echo "⚙️  Switching to $APP_USER user..."
  exec sudo -iu "$APP_USER" bash "$APP_DIR/build.sh"
  exit 0
fi

# ------------------------------
# Now running as ubuntu user
# ------------------------------
echo "👤 Running as: $(whoami)"
cd "$APP_DIR"
echo "📂 Working directory: $(pwd)"

# ------------------------------
# Node / npm check
# ------------------------------
if ! command -v node >/dev/null 2>&1; then
  echo "❌ Node.js not found in PATH!"
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "❌ npm not found in PATH!"
  exit 1
fi

echo "✅ Node version: $(node -v)"
echo "✅ npm version:  $(npm -v)"

# ------------------------------
# Install dependencies (only if missing)
# ------------------------------
if [ ! -d node_modules ]; then
  echo "📦 Installing dependencies..."
  if [ -f package-lock.json ]; then
    npm ci
  else
    npm install
  fi
else
  echo "📦 node_modules exists — skipping install."
fi

# ------------------------------
# Build the app
# ------------------------------
echo "🏗️  Building app..."
npm run build

# ------------------------------
# Manage app with PM2
# ------------------------------
if command -v pm2 >/dev/null 2>&1; then
  echo "🚀 Managing app with PM2..."
  if pm2 list | grep -q "$APP_NAME"; then
    echo "🔁 Restarting existing PM2 app: $APP_NAME"
    pm2 restart "$APP_NAME"
  else
    echo "✨ Starting new PM2 app: $APP_NAME"
    pm2 start npm --name "$APP_NAME" -- start
  fi
  pm2 save
else
  echo "⚠️  PM2 not found — starting directly (Ctrl+C to stop)"
  npm start
fi

echo "✅ Build and deployment complete."
