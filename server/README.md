# SADOVA — Backend

Express + TypeScript + Prisma (MySQL). Разворачивается отдельно от фронтенда
(Lovable хостит только фронт).

## Быстрый старт

```bash
cd server
cp .env.example .env       # заполните DATABASE_URL и секреты
npm install
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

Backend поднимется на `http://localhost:4000`.

## Что реализовано

- **Auth**: регистрация, вход, JWT (access + refresh, ротация с хранением в БД),
  bcrypt-хеш паролей, rate-limit против брутфорса.
- **Products**: публичный листинг + карточка, admin CRUD.
- **Orders**: создание с фиксацией согласия (IP + user-agent + timestamp),
  список заказов пользователя.
- **Reviews**: создание с XSS-санитизацией, модерация полем `approved`.
- **Payments**: интеграция ЮKassa (create + webhook). Договор считается
  заключённым в момент `payment.succeeded` — статус заказа → `PAID`.
- **Security**: Helmet, CORS с whitelist, express-rate-limit, Prisma защищает
  от SQL-injection, xss-санитизация пользовательского текста.

## Что подключается отдельно (нужны ключи от вас)

- **CloudPayments / Tinkoff Pay / СБП QR** — по образцу
  `routes/payments.ts`.
- **СДЭК / Boxberry / Почта / DPD** — расчёт стоимости и получение списка
  ПВЗ (используются как в бэкенде для калькуляции, так и во фронтенде для
  карты).
- **Socket.io** для чата поддержки — заготовка зависимостей уже в
  `package.json`; добавляется `server.on('connection', …)` рядом с
  `app.listen`.

## Как связать с фронтендом

На фронте создайте `.env` с `VITE_API_URL=https://api.sadova.example` и
добавьте fetch-обёртку. Каталог сейчас использует статический mock
(`src/lib/products.ts`) — замените его на `GET /api/products`, когда бэкенд
будет развёрнут.

## Деплой

Любой VPS (Ubuntu 22.04+): Node 20+, MySQL 8, nginx как reverse-proxy с TLS
(certbot), pm2 или systemd для процесса Node. Отдельный домен для API:
`api.sadova.example`.