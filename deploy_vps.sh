#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_ROOT"

# Загрузка переменных из .env.deploy или .env.local (если есть)
for env_file in ".env.deploy" ".env.local"; do
  if [[ -f "$env_file" ]]; then
    while IFS= read -r line || [[ -n "$line" ]]; do
      line="${line%$'\r'}"
      [[ -z "$line" || "$line" == \#* || "$line" != *=* ]] && continue
      key="${line%%=*}"
      val="${line#*=}"
      key="$(echo "$key" | xargs)"
      val="${val#\"}" ; val="${val%\"}"
      val="${val#\'}" ; val="${val%\'}"
      if [[ -n "$key" && -z "${!key:-}" ]]; then
        export "$key=$val"
      fi
    done < "$env_file"
  fi
done

VPS_HOST="${VPS_HOST:-103.31.76.140}"
VPS_PORT="${VPS_PORT:-22}"
VPS_USER="${VPS_USER:-root}"
VPS_WEB_ROOT="${VPS_WEB_ROOT:-}"

SKIP_BUILD=false
for arg in "$@"; do
  if [[ "$arg" == "--skip-build" ]]; then
    SKIP_BUILD=true
  fi
done

if [[ "$SKIP_BUILD" == "false" ]]; then
  echo "▶ Сборка проекта (npm run build)..."
  npm run build
  echo "▶ Упаковка out/ в site.tar.gz..."
  COPYFILE_DISABLE=1 tar -czf site.tar.gz -C out .
fi

if [[ ! -f "site.tar.gz" ]]; then
  echo "Ошибка: архив site.tar.gz не найден."
  exit 1
fi

# Выбор SSH-ключа
SSH_KEY=""
if [[ -n "${VPS_KEY:-}" ]]; then
  SSH_KEY="${VPS_KEY/#\~/$HOME}"
elif [[ -f "$HOME/.ssh/portfolio_vps_ed25519" ]]; then
  SSH_KEY="$HOME/.ssh/portfolio_vps_ed25519"
elif [[ -f "$HOME/.ssh/id_ed25519" ]]; then
  SSH_KEY="$HOME/.ssh/id_ed25519"
fi

# Если есть подходящий ключ и он работает без пароля — деплоим нативными ssh/scp
if [[ -n "$SSH_KEY" && -f "$SSH_KEY" ]]; then
  SSH_OPTS=(-o BatchMode=yes -o StrictHostKeyChecking=accept-new -p "$VPS_PORT" -i "$SSH_KEY")
  SCP_OPTS=(-o BatchMode=yes -o StrictHostKeyChecking=accept-new -P "$VPS_PORT" -i "$SSH_KEY")

  if ssh "${SSH_OPTS[@]}" "$VPS_USER@$VPS_HOST" "true" 2>/dev/null; then
    echo "============================================================"
    echo "  ДЕПЛОЙ ПОРТФОЛИО НА VPS (vladakhmetov.com) через SSH-ключ"
    echo "============================================================"

    if [[ -z "$VPS_WEB_ROOT" ]]; then
      VPS_WEB_ROOT=$(ssh "${SSH_OPTS[@]}" "$VPS_USER@$VPS_HOST" \
        "grep -m 1 -oP 'root\s+\K[^;]+' /etc/nginx/sites-enabled/vladakhmetov* 2>/dev/null || \
         grep -m 1 -oP 'root\s+\K[^;]+' /etc/nginx/sites-enabled/* 2>/dev/null || \
         ([ -d /var/www/vladakhmetov.com ] && echo /var/www/vladakhmetov.com || echo /var/www/html)")
    fi
    echo "▶ Веб-директория: $VPS_WEB_ROOT"

    echo "▶ Загрузка site.tar.gz на сервер..."
    scp "${SCP_OPTS[@]}" site.tar.gz "$VPS_USER@$VPS_HOST:/tmp/site.tar.gz"

    echo "▶ Распаковка и перезагрузка nginx..."
    ssh "${SSH_OPTS[@]}" "$VPS_USER@$VPS_HOST" \
      "mkdir -p '$VPS_WEB_ROOT' && \
       tar -xzf /tmp/site.tar.gz -C '$VPS_WEB_ROOT' && \
       rm -f /tmp/site.tar.gz && \
       (chown -R www-data:www-data '$VPS_WEB_ROOT' 2>/dev/null || chown -R nginx:nginx '$VPS_WEB_ROOT' 2>/dev/null || true) && \
       nginx -t && (systemctl reload nginx || systemctl restart nginx)"

    echo "============================================================"
    echo "  ДЕПЛОЙ УСПЕШНО ЗАВЕРШЕН: https://vladakhmetov.com/"
    echo "============================================================"
    exit 0
  fi
fi

# Фоллбэк на Python-скрипт (если используется passphrase или VPS_PASSWORD)
echo "▶ Переключение на Python deploy_vps.py..."
python3 scripts/deploy_vps.py
