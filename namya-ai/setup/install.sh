#!/bin/bash
# Namya AI: one-time setup for the Mac mini.
# Creates ~/namya with the settings file (docker-compose.yml) and a private
# passwords file (.env). Safe to run again: it never replaces existing passwords.
set -euo pipefail

DIR="${NAMYA_DIR:-$HOME/namya}"
mkdir -p "$DIR"
cd "$DIR"

# Apple chip (M1, M2, M4...) needs the ARM version of WAHA.
if [ "$(uname -m)" = "arm64" ]; then
  WAHA_IMAGE="devlikeapro/waha:arm"
else
  WAHA_IMAGE="devlikeapro/waha:latest"
fi

secret() { openssl rand -hex 16; }

if [ -f .env ]; then
  echo "Passwords file already exists, keeping it: $DIR/.env"
else
  umask 077
  cat > .env <<EOF
# Namya AI private settings. Do not share this file.
WAHA_IMAGE=$WAHA_IMAGE
WAHA_API_KEY=$(secret)
WAHA_DASHBOARD_USERNAME=namya
WAHA_DASHBOARD_PASSWORD=$(secret)
N8N_ENCRYPTION_KEY=$(secret)
EOF
  echo "Created passwords file: $DIR/.env"
fi

cat > docker-compose.yml <<'EOF'
# Namya AI services. Both only listen on this Mac (127.0.0.1), not the internet.
services:
  waha:
    image: ${WAHA_IMAGE}
    restart: unless-stopped
    ports:
      - "127.0.0.1:3000:3000"
    environment:
      WAHA_API_KEY: ${WAHA_API_KEY}
      WHATSAPP_API_KEY: ${WAHA_API_KEY}
      WAHA_DASHBOARD_USERNAME: ${WAHA_DASHBOARD_USERNAME}
      WAHA_DASHBOARD_PASSWORD: ${WAHA_DASHBOARD_PASSWORD}
      WHATSAPP_SWAGGER_USERNAME: ${WAHA_DASHBOARD_USERNAME}
      WHATSAPP_SWAGGER_PASSWORD: ${WAHA_DASHBOARD_PASSWORD}
      WHATSAPP_DEFAULT_ENGINE: WEBJS
      TZ: Asia/Kathmandu
    volumes:
      - waha_sessions:/app/.sessions
      - waha_media:/app/.media

  n8n:
    image: docker.n8n.io/n8nio/n8n
    restart: unless-stopped
    ports:
      - "127.0.0.1:5678:5678"
    environment:
      GENERIC_TIMEZONE: Asia/Kathmandu
      TZ: Asia/Kathmandu
      N8N_ENCRYPTION_KEY: ${N8N_ENCRYPTION_KEY}
    volumes:
      - n8n_data:/home/node/.n8n

volumes:
  waha_sessions:
  waha_media:
  n8n_data:
EOF

echo ""
echo "Setup files are ready in $DIR"
echo "Next step from the guide: run   cd ~/namya && docker compose up -d"
