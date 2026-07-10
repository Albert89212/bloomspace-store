# Деплой SADOVA на Beget

Инструкция для развёртывания магазина на хостинге **beget.com**. Поддерживаются два варианта: **VPS** (рекомендуется) и **Shared-хостинг с Node.js**.

---

## Вариант 1. VPS Beget (рекомендуется)

### 1. Заказ VPS
1. Beget → Виртуальные серверы → **Ubuntu 22.04**, тариф от 2 CPU / 2 GB RAM.
2. Получите IP и root-пароль на email.

### 2. Подключение и подготовка сервера
```bash
ssh root@ВАШ_IP
apt update && apt upgrade -y
apt install -y curl git nginx mysql-server certbot python3-certbot-nginx ufw

# Node.js 22 LTS
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs

# Bun (проект собирается на Bun)
curl -fsSL https://bun.sh/install | bash
export PATH="$HOME/.bun/bin:$PATH"

# PM2 (менеджер процессов)
npm i -g pm2

# Firewall
ufw allow OpenSSH && ufw allow 'Nginx Full' && ufw --force enable
```

### 3. База данных MySQL
```bash
mysql_secure_installation
mysql -u root -p <<'SQL'
CREATE DATABASE sadova CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'sadova'@'localhost' IDENTIFIED BY 'СильныйПароль123!';
GRANT ALL PRIVILEGES ON sadova.* TO 'sadova'@'localhost';
FLUSH PRIVILEGES;
SQL
```

### 4. Код и переменные окружения
```bash
mkdir -p /var/www && cd /var/www
git clone https://github.com/ВАШ_РЕПО/sadova.git
cd sadova
cp .env.example .env
nano .env   # заполнить DATABASE_URL, SESSION_SECRET, SMTP, YooKassa и т.д.

bun install --frozen-lockfile
bunx prisma migrate deploy
bunx prisma generate
bun run build
```

### 5. Запуск через PM2
```bash
pm2 start "bun run start" --name sadova --cwd /var/www/sadova
pm2 save
pm2 startup systemd    # выполнить показанную команду
```

### 6. Nginx + SSL
Скопируйте `deploy/nginx.conf` в `/etc/nginx/sites-available/sadova`, замените `sadova.ru` на свой домен:
```bash
cp deploy/nginx.conf /etc/nginx/sites-available/sadova
ln -s /etc/nginx/sites-available/sadova /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
certbot --nginx -d sadova.ru -d www.sadova.ru
```

### 7. DNS в панели Beget
A-запись `@` → IP VPS, A-запись `www` → IP VPS. Ждём 15–60 минут.

---

## Вариант 2. Shared-хостинг Beget с Node.js

1. Панель Beget → **Сайты** → создать сайт `sadova.ru`.
2. Панель → **MySQL** → создать БД `login_sadova`, пользователя, пароль.
3. Панель → **Node.js** → создать приложение:
   - Версия: **Node.js 22**
   - Директория: `/home/login/sadova.ru/public_html`
   - Стартовый файл: `.output/server/index.mjs`
   - Переменные окружения: скопировать из `.env.example`
4. Загрузите файлы (FileZilla/SFTP) или подключите Git через панель.
5. В терминале Beget (SSH):
   ```bash
   cd ~/sadova.ru/public_html
   rm -rf node_modules package-lock.json
   npm install
   npx prisma@5.22.0 generate
   npx prisma@5.22.0 migrate deploy
   npm run build
   ```
6. В панели Node.js нажмите **Перезапустить**.

---

## Обновление кода
```bash
cd /var/www/sadova
git pull
bun install --frozen-lockfile
bunx prisma migrate deploy
bun run build
pm2 restart sadova
```

## Резервные копии
```bash
# ежедневный дамп БД
echo '0 3 * * * mysqldump -u sadova -pПАРОЛЬ sadova | gzip > /var/backups/sadova_$(date +\%F).sql.gz' | crontab -
```

## Мониторинг
- Логи приложения: `pm2 logs sadova`
- Логи Nginx: `/var/log/nginx/error.log`
- Статус: `pm2 status`

---

## Чек-лист перед запуском
- [ ] Домен привязан, SSL выпущен
- [ ] `.env` заполнен, `SESSION_SECRET`/`JWT_SECRET` уникальны
- [ ] `prisma migrate deploy` выполнен
- [ ] SMTP настроен и письма с OTP приходят
- [ ] ЮKassa: URL уведомлений `https://sadova.ru/api/payments/yookassa/webhook`
- [ ] Резервные копии БД в cron
- [ ] robots.txt и sitemap.xml доступны