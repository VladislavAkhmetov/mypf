# Настройка рабочего окружения и доступов на macOS (для разработчика и ИИ-агента)

Этот документ описывает, как быстро развернуть проект на новом Mac с теми же доступами (GitHub, деплой на VPS по SSH-ключу, сборка, тесты).

---

## 1. Системные зависимости на macOS

1. **Node.js 22+** (рекомендуется через `nvm` или Homebrew):
   ```bash
   brew install node git gh
   ```
2. **Клонирование репозитория и установка пакетов:**
   ```bash
   git clone https://github.com/VladislavAkhmetov/mypf.git
   cd mypf
   npm ci
   ```
3. **E2E-тесты (опционально, Playwright):**
   ```bash
   npx playwright install chromium
   ```

---

## 2. Доступ к GitHub

Чтобы пушить изменения в репозиторий `VladislavAkhmetov/mypf`:

```bash
gh auth login
# Выберите: GitHub.com -> HTTPS (или SSH) -> Login with a web browser
gh auth status
```

Проверка: `git push` должен работать без запроса пароля.

---

## 3. Доступ к VPS (`vladakhmetov.com` / `103.31.76.140`) по SSH-ключу

Проект настроен на беспарольный деплой по SSH-ключу (без хранения пароля в `.env.deploy`).

### Вариант A: Перенести уже выпущенный ключ деплоя
1. Скопируйте файл приватного ключа `portfolio_vps_ed25519` с Windows (`%USERPROFILE%\.ssh\portfolio_vps_ed25519`) на Mac в `~/.ssh/portfolio_vps_ed25519`.
2. Установите строгие права доступа (обязательно для macOS OpenSSH):
   ```bash
   mkdir -p ~/.ssh && chmod 700 ~/.ssh
   chmod 600 ~/.ssh/portfolio_vps_ed25519
   ```

### Вариант B: Сгенерировать новый ключ прямо на Mac
Если перенос файла неудобен:
```bash
ssh-keygen -t ed25519 -N "" -C "vlad-mac-deploy" -f ~/.ssh/portfolio_vps_ed25519
# Добавьте ~/.ssh/portfolio_vps_ed25519.pub в /root/.ssh/authorized_keys на сервере 103.31.76.140
```

### Проверка SSH-подключения
```bash
ssh -i ~/.ssh/portfolio_vps_ed25519 root@103.31.76.140 "echo OK"
```

### Конфигурация `.env.deploy` (не попадает в git)
Создайте `.env.deploy` в корне проекта:
```env
VPS_HOST=103.31.76.140
VPS_PORT=22
VPS_USER=root
VPS_KEY=~/.ssh/portfolio_vps_ed25519
VPS_WEB_ROOT=/var/www/vladakhmetov.com
```

---

## 4. Сборка, тесты и деплой

- **Unit-тесты:** `npm test`
- **Локальная разработка:** `npm run dev`
- **Сборка и деплой на macOS (включая `COPYFILE_DISABLE=1`, чтобы tar не упаковывал метаданные macOS `._*`):**
  ```bash
  bash deploy_vps.sh
  ```
  Скрипт сам выполнит `npm run build`, упакует `out/` в `site.tar.gz`, загрузит по `scp` на VPS, распакует в `/var/www/vladakhmetov.com` и перезагрузит `nginx`.

---

## 5. Дополнительно (Figma MCP)
Если на Mac используется Figma MCP-плагин в IDE/агенте, потребуется один раз авторизоваться в Figma через интерфейс плагинов IDE (`Plugins Manager`).
