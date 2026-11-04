"use client";

import React, { useState } from "react";
import styles from "./help-center.module.css";
import { useLocale } from "@/lib/i18n";

type Tr = (ru: string, en: string) => string;

// Brief builder: six blocks of a good AI task; missing blocks show what the model will guess.

const blocksFor = (tr: Tr) => [
  {
    id: "context",
    label: tr("Контекст", "Context"),
    text: tr("Мини-CRM для небольшой студии. Заявки приходят в Telegram и теряются в переписке.", "A mini CRM for a small studio. Leads arrive in Telegram and get lost in the chat."),
    guess: tr("Сделает универсальную CRM «для бизнеса» с лишними разделами.", "Builds a generic \"business\" CRM with sections nobody needs."),
  },
  {
    id: "user",
    label: tr("Пользователь", "User"),
    text: tr("Менеджер студии, работает с телефона, 10–30 заявок в день.", "A studio manager working from a phone, 10–30 leads a day."),
    guess: tr("Нарисует десктопную админку с таблицами, неудобную на телефоне.", "Draws a desktop admin panel full of tables that is awkward on a phone."),
  },
  {
    id: "flow",
    label: tr("Сценарий", "Scenario"),
    text: tr("Клиент пишет боту → бот задаёт 3 вопроса → заявка появляется в списке → менеджер меняет статус: новая, в работе, закрыта.", "A client messages the bot → the bot asks 3 questions → the lead shows up in the list → the manager changes its status: new, in progress, closed."),
    guess: tr("Сделает отдельные экраны, но не свяжет их в путь от заявки до результата.", "Makes separate screens but does not link them into a path from lead to result."),
  },
  {
    id: "data",
    label: tr("Данные", "Data"),
    text: tr("Заявка: имя, контакт, услуга, бюджет, статус, дата. Пример: «Анна, @anna, лендинг, 50 000 ₽, новая, 12.09».", "Lead: name, contact, service, budget, status, date. Example: \"Anna, @anna, landing page, $600, new, 12.09\"."),
    guess: tr("Придумает поля сама — половина не совпадёт с реальностью.", "Invents the fields itself — half of them will not match reality."),
  },
  {
    id: "limits",
    label: tr("Ограничения", "Constraints"),
    text: tr("Telegram Mini App, интерфейс на русском, без платёжных функций и без отдельной регистрации.", "Telegram Mini App, English interface, no payments and no separate sign-up."),
    guess: tr("Выберет стек и сервисы на свой вкус, включая платные.", "Picks a stack and services to its own taste, paid ones included."),
  },
  {
    id: "done",
    label: tr("Готовность", "Done"),
    text: tr("Заявка из бота появляется в списке за 5 секунд, статус меняется в два касания, после перезагрузки данные на месте.", "A lead from the bot appears in the list within 5 seconds, the status changes in two taps, and the data survives a reload."),
    guess: tr("Остановится на «выглядит готово» и не проверит сценарий.", "Stops at \"looks done\" and never checks the scenario."),
  },
];

export function PromptBuilder() {
  const { tr } = useLocale();
  const BLOCKS = blocksFor(tr);
  const [enabled, setEnabled] = useState<Record<string, boolean>>({ context: true });
  const [copied, setCopied] = useState(false);
  const on = BLOCKS.filter(block => enabled[block.id]);
  const off = BLOCKS.filter(block => !enabled[block.id]);
  const prompt = on.length
    ? `${tr("Сделай прототип.", "Build a prototype.")}\n\n${on.map(block => `${block.label}: ${block.text}`).join("\n\n")}`
    : tr("Сделай CRM для телеграма.", "Build a CRM for Telegram.");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className={styles.sandboxFrame}>
      <div className={styles.pbLayout}>
        <fieldset className={styles.pbBlocks}>
          <legend>{tr("Блоки брифа", "Brief blocks")}</legend>
          {BLOCKS.map(block => (
            <label key={block.id} className={styles.pbCheck}>
              <input type="checkbox" checked={!!enabled[block.id]} onChange={e => setEnabled(s => ({ ...s, [block.id]: e.target.checked }))} />
              <span>{block.label}</span>
            </label>
          ))}
          <div className={styles.pbMeter} aria-label={`${tr("Заполнено", "Filled")} ${on.length} ${tr("из", "of")} 6`}>
            <span>{tr("Бриф", "Brief")}: {on.length} {tr("из", "of")} 6</span>
            <i>{BLOCKS.map(block => <b key={block.id} className={enabled[block.id] ? styles.pbMeterOn : ""} />)}</i>
          </div>
          <div className={styles.segment}>
            <button type="button" onClick={() => setEnabled(Object.fromEntries(BLOCKS.map(b => [b.id, true])))}>{tr("Все", "All")}</button>
            <button type="button" onClick={() => setEnabled({})}>{tr("Ни одного", "None")}</button>
          </div>
        </fieldset>
        <div className={styles.pbResult}>
          <div className={styles.pbPromptHead}>
            <span>{tr("Запрос", "Request")}</span>
            <button type="button" className={styles.xpButton} onClick={copy}>{copied ? tr("Скопировано", "Copied") : tr("Копировать", "Copy")}</button>
          </div>
          <pre className={styles.pbPrompt}>{prompt}</pre>
          {off.length > 0 ? (
            <div className={styles.pbGuesses}>
              <b>{tr("Что модель додумает сама", "What the model will invent")}</b>
              <ul>
                {off.map(block => (
                  <li key={block.id}><span>{block.label}:</span> {block.guess}</li>
                ))}
              </ul>
            </div>
          ) : (
            <p className={styles.pbDone}>{tr("Все шесть блоков на месте — модели почти нечего додумывать.", "All six blocks are in — the model has almost nothing left to guess.")}</p>
          )}
        </div>
      </div>
    </div>
  );
}
