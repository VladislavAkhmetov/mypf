This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Design documentation

[Бэклог задач](BACKLOG.md) — актуальный список задач и планов по развитию проекта.

[Актуальная концепция v2: личный компьютер, работы, инструменты и жизнь](docs/design/personal-desktop-design-v2.md) — избранные проекты на первом экране, пополняемая коллекция плагинов и скриптов, журнал обновлений, личный контент, современное оформление кейсов и приложений.

[Подробный дизайн-документ портфолио в стиле Windows XP](docs/design/xp-portfolio-design-doc.md) — аудит с позиций HR, арт-директора и технического лида, концепция, визуальная система, сценарии, идеи игр, требования и план реализации.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Деплой (статический сайт)

Сайт собирается в обычные статические файлы, поэтому сервер с Node.js не нужен.

1. `npm run build`: готовый сайт появится в папке `out/`.
2. Проверить сборку локально: `npx serve out` (или любой статический сервер).
3. **Yandex Object Storage**: создайте бакет с публичным доступом на чтение, включите «Веб-сайт» → «Хостинг», укажите главную страницу `index.html` и страницу ошибки `404.html`, затем загрузите **содержимое** папки `out/` в корень бакета.
4. **Любой VPS (например, FirstVDS)**: скопируйте содержимое `out/` в папку сайта nginx.

Старые ссылки `/work/<slug>` открывают нужный проект через статические страницы переадресации.
