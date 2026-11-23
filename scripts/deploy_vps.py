#!/usr/bin/env python3
"""
Скрипт развертывания обновленного портфолио на VPS (vladakhmetov.com / 103.31.76.140).
Загружает архив site.tar.gz, распаковывает в веб-директорию nginx и перезагружает сервер.
"""
import getpass
import os
import sys
import time
from pathlib import Path

try:
    import paramiko
except ImportError:
    print("Ошибка: библиотека paramiko не найдена.")
    print("Установите ее: pip install paramiko")
    sys.exit(1)

if sys.stdout and hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if sys.stderr and hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

PROJECT_ROOT = Path(__file__).resolve().parent.parent


def load_env_file():
    """Загружает переменные окружения из .env.deploy или .env.local, если они существуют."""
    for name in [".env.deploy", ".env.local"]:
        env_path = PROJECT_ROOT / name
        if env_path.exists():
            try:
                with open(env_path, "r", encoding="utf-8") as f:
                    for line in f:
                        line = line.strip()
                        if line and not line.startswith("#") and "=" in line:
                            k, v = line.split("=", 1)
                            k = k.strip()
                            v = v.strip().strip("\"'")
                            if k and k not in os.environ:
                                os.environ[k] = v
            except Exception:
                pass


load_env_file()

SERVER_HOST = os.environ.get("VPS_HOST", "103.31.76.140")
SERVER_PORT = int(os.environ.get("VPS_PORT", 22))
SERVER_USER = os.environ.get("VPS_USER", "root")
KEY_PATH = Path(os.environ.get("VPS_KEY", Path.home() / ".ssh" / "id_ed25519"))
ARCHIVE_PATH = PROJECT_ROOT / "site.tar.gz"


def get_credentials():
    secret = os.environ.get("VPS_PASSPHRASE") or os.environ.get("VPS_PASSWORD")
    if secret:
        print("🔐 Реквизиты авторизации загружены из конфигурации (.env.deploy / переменные окружения)")
    elif len(sys.argv) > 1:
        secret = sys.argv[1]
    if not secret:
        print(f"Подключение к {SERVER_USER}@{SERVER_HOST}:{SERVER_PORT}")
        print("Ключ: " + str(KEY_PATH))
        secret = getpass.getpass("Введите пароль / passphrase для SSH-ключа id_ed25519: ")
    return secret


def connect_ssh(secret):
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

    # Попытка 1: через ключ id_ed25519 с passphrase
    if KEY_PATH.exists():
        try:
            print(f"Попытка авторизации по ключу {KEY_PATH.name}...")
            key = paramiko.Ed25519Key.from_private_key_file(str(KEY_PATH), password=secret if secret else None)
            client.connect(
                SERVER_HOST,
                port=SERVER_PORT,
                username=SERVER_USER,
                pkey=key,
                timeout=10,
            )
            print(" Авторизован по SSH-ключу!")
            return client
        except Exception as e:
            print(f"Авторизация по ключу не удалась: {e}")

    # Попытка 2: по паролю root
    try:
        print("Попытка авторизации по паролю пользователя root...")
        client.connect(
            SERVER_HOST,
            port=SERVER_PORT,
            username=SERVER_USER,
            password=secret,
            timeout=10,
        )
        print(" Авторизован по паролю root!")
        return client
    except Exception as e:
        print(f"Авторизация по паролю не удалась: {e}")

    raise RuntimeError("Не удалось подключиться к VPS. Проверьте пароль или passphrase.")


def run_command(client, command, check=True):
    print(f"▶ {command}")
    stdin, stdout, stderr = client.exec_command(command)
    exit_status = stdout.channel.recv_exit_status()
    out = stdout.read().decode("utf-8", errors="replace").strip()
    err = stderr.read().decode("utf-8", errors="replace").strip()
    if out:
        print(out)
    if exit_status != 0 and check:
        raise RuntimeError(f"Команда завершилась с кодом {exit_status}: {err}")
    return out


def progress_callback(transferred, total):
    percent = (transferred / total) * 100
    mb_transferred = transferred / (1024 * 1024)
    mb_total = total / (1024 * 1024)
    bar_len = 30
    filled = int(bar_len * transferred // total)
    bar = "=" * filled + "-" * (bar_len - filled)
    sys.stdout.write(f"\r  Загрузка: [{bar}] {percent:5.1f}% ({mb_transferred:.1f}/{mb_total:.1f} MB)")
    sys.stdout.flush()


def main():
    if not ARCHIVE_PATH.exists():
        print(f"Ошибка: файл архива {ARCHIVE_PATH} не найден.")
        print("Сначала соберите проект: npm run build && tar -czf site.tar.gz -C out .")
        sys.exit(1)

    print("=" * 60)
    print("  ДЕПЛОЙ ПОРТФОЛИО НА VPS (vladakhmetov.com)")
    print("=" * 60)
    print(f"Размер архива: {ARCHIVE_PATH.stat().st_size / (1024 * 1024):.2f} MB")

    secret = get_credentials()
    client = connect_ssh(secret)

    try:
        # Определяем директорию сайта в nginx
        print("\n🔍 Определение директории сайта на сервере...")
        web_root = None
        try:
            detected = run_command(client, "grep -m 1 -oP 'root\\s+\\K[^;]+' /etc/nginx/sites-enabled/* 2>/dev/null", check=False)
            if detected and "/" in detected:
                web_root = detected.strip()
        except Exception:
            pass

        if not web_root:
            web_root = "/var/www/html"

        print(f" Веб-директория: {web_root}")

        # Создаем папку, если ее нет
        run_command(client, f"mkdir -p {web_root}")

        # Загрузка архива через SFTP
        remote_tmp = "/tmp/site.tar.gz"
        print(f"\n Загрузка архива на сервер ({remote_tmp})...")
        sftp = client.open_sftp()
        sftp.put(str(ARCHIVE_PATH), remote_tmp, callback=progress_callback)
        sftp.close()
        print("\n Загрузка архива завершена!")

        # Распаковка на сервере
        print(f"\n Распаковка в {web_root}...")
        run_command(client, f"tar -xzf {remote_tmp} -C {web_root}")
        run_command(client, f"rm -f {remote_tmp}")

        # Настройка прав и перезапуск nginx
        print("\n Проверка и перезагрузка nginx...")
        run_command(client, f"chown -R www-data:www-data {web_root} 2>/dev/null || chown -R nginx:nginx {web_root} 2>/dev/null || true", check=False)
        run_command(client, "nginx -t && (systemctl reload nginx || systemctl restart nginx)")

        print("\n" + "=" * 60)
        print(" ДЕПЛОЙ УСПЕШНО ЗАВЕРШЕН!")
        print(" Сайт обновлен: https://vladakhmetov.com/")
        print("=" * 60)

    finally:
        client.close()


if __name__ == "__main__":
    main()
