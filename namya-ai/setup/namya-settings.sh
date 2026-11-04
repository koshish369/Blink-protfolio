#!/bin/bash
# Namya AI: asks for Namya's settings and saves them privately in ~/namya/.env
# Run on the Mac mini. Safe to run again to change an answer.
set -euo pipefail
DIR="${NAMYA_DIR:-$HOME/namya}"
ENV_FILE="$DIR/.env"
if [ ! -f "$ENV_FILE" ]; then
  echo "Run install.sh first (no $ENV_FILE yet)."; exit 1
fi

set_var() {
  local key="$1" val="$2"
  { grep -v "^$key=" "$ENV_FILE" || true; printf "%s='%s'\n" "$key" "$val"; } > "$ENV_FILE.tmp"
  mv "$ENV_FILE.tmp" "$ENV_FILE"
  chmod 600 "$ENV_FILE"
}

# ask VAR "question" "regex the answer must match" "hint if wrong"
ask() {
  local var="$1" question="$2" pattern="$3" hint="$4" val
  while true; do
    printf '\n%s\n> ' "$question"
    IFS= read -r -u 3 val || { echo; echo "Stopped."; exit 1; }
    val="$(printf '%s' "$val" | tr -d '[:space:]')"
    if [ "$var" = "NAMYA_SUNIL_NUMBER" ]; then val="$(printf '%s' "$val" | tr -cd '0-9')"; fi
    if [[ "$val" == *"'"* ]]; then echo "Please don't use the ' character."; continue; fi
    if [[ "$val" =~ $pattern ]]; then set_var "$var" "$val"; echo "Saved."; return; fi
    echo "That doesn't look right. $hint"
  done
}

exec 3< "${NAMYA_TTY:-/dev/tty}"
echo "Namya settings: paste each answer and press Enter."
ask NAMYA_SHEET_URL "1/4  Paste the sheet script URL (starts https://script.google.com, ends /exec):" \
  '^https://script\.google\.com/.+/exec$' "It must start with https://script.google.com and end with /exec."
ask NAMYA_KEY "2/4  Paste the NAMYA_KEY password you set in the sheet script:" \
  '^.{12,}$' "It should be at least 12 characters."
ask NAMYA_SUNIL_NUMBER "3/4  Type Sunil's WhatsApp number with 977 (for example 9779812345678):" \
  '^977[0-9]{8,12}$' "Start with 977, then the number, no + or spaces."
ask ANTHROPIC_API_KEY "4/4  Paste the Anthropic API key (starts sk-ant-):" \
  '^sk-ant-.{20,}$' "It must start with sk-ant-"
echo ""
echo "All 4 saved in $ENV_FILE (private)."
