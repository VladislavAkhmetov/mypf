"use client";

import { CaseClip } from "./case-clip";
import styles from "./tasker-case.module.css";
import { useLocale } from "@/lib/i18n";

type Tr = (ru: string, en: string) => string;

const media = (name: string) => `/images/tasker-case/${name}`;

export function TaskerCase() {
  const { tr } = useLocale();
  return (
    <div className={styles.wrap}>
      <section className={styles.intro}>
        <p className={styles.lead}>
          {tr(
            "Студия делала карточки товаров для ритейлера. Я разработал бота и Telegram-приложение: артикул закрепляется за дизайнером одним нажатием, этапы видны всей команде. Отчеты по всем заданиям можно выгружать в Excel и Google таблицы. Моя роль — продукт, дизайн и разработка.",
            "A studio made product cards for a retailer. I built a bot and a Telegram app: an article is claimed by a designer with one tap, and all stages are visible to the team. Reports across all assignments export to Excel and Google Sheets. My role: product, design, and development."
          )}
        </p>
      </section>

      <figure className={styles.figure}>
        <CaseClip src={media("dashboard.mp4")} poster={media("dashboard-poster.webp")} ratio="16 / 10" label={tr("Дашборд тимлида: артикул передают заказчику, затем открывается аналитика", "Team lead dashboard: an item is sent to the client, then analytics opens")} />
        <figcaption className={styles.caption}>
          <b>{tr("Дашборд тимлида", "Team lead dashboard")}</b>
          <span>{tr("Все артикулы по этапам. Дальше они переходят, когда макет сдан, проверен и согласован.", "Every item by stage. It moves on once the layout is submitted, reviewed and approved.")}</span>
        </figcaption>
      </figure>

      <section className={styles.phoneSection}>
        <div className={styles.phoneText}>
          <b>{tr("В Telegram", "In Telegram")}</b>
          <p>{tr("Дизайнер открывает мини-приложение, берёт свободный артикул и сдаёт макет ссылкой. Команда видит это в чате.", "A designer opens the mini app, takes a free item and submits the layout as a link. The team sees it in the chat.")}</p>
        </div>
        <div className={styles.phoneCenter}>
          <CaseClip
            variant="phone"
            src={media("app.mp4")}
            poster={media("app-poster.webp")}
            label={tr("Мини-приложение: дизайнер берёт артикул в работу и отправляет макет на проверку", "Mini app: a designer takes an item and sends the layout for review")}
          />
        </div>
      </section>

      <section className={styles.tech}>
        <span className={styles.label}>{tr("Технически", "Under the hood")}</span>
        <p>{tr("Python, FastAPI и SQLite, бот на aiogram. Вход по подписи Telegram, без паролей. Один Docker-контейнер за Caddy на обычном сервере. Интерфейс на чистых JS и CSS, без фреймворков. Отчёты выгружаются в Excel и Google Таблицы.", "Python, FastAPI and SQLite, a bot on aiogram. Sign-in with the Telegram signature, no passwords. One Docker container behind Caddy on a plain server. The interface is plain JS and CSS, no frameworks. Reports export to Excel and Google Sheets.")}</p>
      </section>
    </div>
  );
}
