"use client";

import { CaseClip } from "./case-clip";
import styles from "./tasker-case.module.css";
import { useLocale } from "@/lib/i18n";

type Tr = (ru: string, en: string) => string;

const media = (name: string) => `/images/tasker-case/${name}`;

const facts = (tr: Tr): Array<[string, string]> => [
  [tr("Роль", "Role"), tr("Продукт, дизайн, разработка", "Product, design, development")],
  [tr("Контекст", "Context"), tr("Карточки товаров для ритейлера электроники", "Product cards for an electronics retailer")],
  [tr("Платформа", "Platform"), tr("Telegram Mini App, веб", "Telegram Mini App, web")],
  [tr("Стек", "Stack"), "Python, FastAPI, SQLite"],
];

// The stages of an article, in the colours the product itself uses.
const stages = (tr: Tr): Array<[string, string]> => [
  [tr("Свободно", "Free"), "#94a3b8"],
  [tr("В работе", "In progress"), "#fbbf24"],
  [tr("Проверка", "Review"), "#38bdf8"],
  [tr("У заказчика", "With client"), "#c084fc"],
  [tr("На экспорт", "Export"), "#fb923c"],
  [tr("Готово", "Done"), "#4ade80"],
];

export function TaskerCase() {
  const { tr } = useLocale();
  return (
    <div className={styles.wrap}>
      <section className={styles.intro}>
        <dl className={styles.facts}>{facts(tr).map(([term, value]) => <div key={term}><dt>{term}</dt><dd>{value}</dd></div>)}</dl>
        <div className={styles.introText}>
          <p>{tr("Студия делала карточки товаров для ритейлера электроники. Артикулы раздавали в общем чате: двое брали один и тот же, этапы терялись между чатом, макетами и облаком, а тимлид собирал отчёт руками.", "A studio made product cards for an electronics retailer. Items were handed out in a group chat: two people took the same one, stages got lost between the chat, the layouts and the cloud, and the team lead built reports by hand.")}</p>
          <p>{tr("Я сделал бота и мини-приложение прямо в Telegram. Артикул закрепляется за дизайнером одним нажатием, этап виден всей команде, отчёт уходит в Excel.", "I built a bot and a mini app right inside Telegram. A designer claims an item with one tap, the whole team sees its stage, and the report goes to Excel.")}</p>
        </div>
      </section>

      <figure className={styles.figure}>
        <CaseClip src={media("dashboard.mp4")} poster={media("dashboard-poster.webp")} ratio="16 / 10" label={tr("Дашборд тимлида: артикул передают заказчику, затем открывается аналитика", "Team lead dashboard: an item is sent to the client, then analytics opens")} />
        <figcaption className={styles.caption}>
          <b>{tr("Дашборд тимлида", "Team lead dashboard")}</b>
          <span>{tr("Все артикулы по этапам. Дальше они переходят, когда макет сдан, проверен и согласован.", "Every item by stage. It moves on once the layout is submitted, reviewed and approved.")}</span>
        </figcaption>
      </figure>

      <ul className={styles.stages} aria-label={tr("Этапы артикула", "Item stages")}>
        {stages(tr).map(([name, color]) => <li key={name}><i style={{ background: color }} aria-hidden="true" />{name}</li>)}
      </ul>

      <section className={styles.phone}>
        <div className={styles.phoneText}>
          <b>{tr("В Telegram", "In Telegram")}</b>
          <p>{tr("Дизайнер открывает мини-приложение, берёт свободный артикул и сдаёт макет ссылкой. Команда видит это в чате.", "A designer opens the mini app, takes a free item and submits the layout as a link. The team sees it in the chat.")}</p>
        </div>
        <CaseClip className={styles.phoneClip} src={media("app.mp4")} poster={media("app-poster.webp")} ratio="3 / 4" label={tr("Мини-приложение: дизайнер берёт артикул в работу и отправляет макет на проверку", "Mini app: a designer takes an item and sends the layout for review")} />
      </section>

      <section className={styles.tech}>
        <span className={styles.label}>{tr("Технически", "Under the hood")}</span>
        <p>{tr("Python, FastAPI и SQLite, бот на aiogram. Вход по подписи Telegram, без паролей. Один Docker-контейнер за Caddy на обычном сервере. Интерфейс на чистых JS и CSS, без фреймворков. Отчёты выгружаются в Excel и Google Таблицы.", "Python, FastAPI and SQLite, a bot on aiogram. Sign-in with the Telegram signature, no passwords. One Docker container behind Caddy on a plain server. The interface is plain JS and CSS, no frameworks. Reports export to Excel and Google Sheets.")}</p>
      </section>
    </div>
  );
}
