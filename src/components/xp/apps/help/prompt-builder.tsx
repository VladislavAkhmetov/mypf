"use client";

import React, { useState } from "react";
import styles from "./help-center.module.css";

// Brief builder: six blocks of a good AI task; missing blocks show what the model will guess.

const BLOCKS = [
  {
    id: "context",
    label: "Контекст",
    text: "Мини-CRM для небольшой студии. Заявки приходят в Telegram и теряются в переписке.",
    guess: "Сделает универсальную CRM «для бизнеса» с лишними разделами.",
  },
  {
    id: "user",
    label: "Пользователь",
    text: "Менеджер студии, работает с телефона, 10–30 заявок в день.",
    guess: "Нарисует десктопную админку с таблицами, неудобную на телефоне.",
  },
  {
    id: "flow",
    label: "Сценарий",
    text: "Клиент пишет боту → бот задаёт 3 вопроса → заявка появляется в списке → менеджер меняет статус: новая, в работе, закрыта.",
    guess: "Сделает отдельные экраны, но не свяжет их в путь от заявки до результата.",
  },
  {
    id: "data",
    label: "Данные",
    text: "Заявка: имя, контакт, услуга, бюджет, статус, дата. Пример: «Анна, @anna, лендинг, 50 000 ₽, новая, 12.09».",
    guess: "Придумает поля сама — половина не совпадёт с реальностью.",
  },
  {
    id: "limits",
    label: "Ограничения",
    text: "Telegram Mini App, интерфейс на русском, без платёжных функций и без отдельной регистрации.",
    guess: "Выберет стек и сервисы на свой вкус, включая платные.",
  },
  {
    id: "done",
    label: "Готовность",
    text: "Заявка из бота появляется в списке за 5 секунд, статус меняется в два касания, после перезагрузки данные на месте.",
    guess: "Остановится на «выглядит готово» и не проверит сценарий.",
  },
];

export function PromptBuilder() {
  const [enabled, setEnabled] = useState<Record<string, boolean>>({ context: true });
  const [copied, setCopied] = useState(false);
  const on = BLOCKS.filter(block => enabled[block.id]);
  const off = BLOCKS.filter(block => !enabled[block.id]);
  const prompt = on.length
    ? `Сделай прототип.\n\n${on.map(block => `${block.label}: ${block.text}`).join("\n\n")}`
    : "Сделай CRM для телеграма.";

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
          <legend>Блоки брифа</legend>
          {BLOCKS.map(block => (
            <label key={block.id} className={styles.pbCheck}>
              <input type="checkbox" checked={!!enabled[block.id]} onChange={e => setEnabled(s => ({ ...s, [block.id]: e.target.checked }))} />
              <span>{block.label}</span>
            </label>
          ))}
          <div className={styles.pbMeter} aria-label={`Заполнено ${on.length} из 6`}>
            <span>Бриф: {on.length} из 6</span>
            <i>{BLOCKS.map(block => <b key={block.id} className={enabled[block.id] ? styles.pbMeterOn : ""} />)}</i>
          </div>
          <div className={styles.segment}>
            <button type="button" onClick={() => setEnabled(Object.fromEntries(BLOCKS.map(b => [b.id, true])))}>Все</button>
            <button type="button" onClick={() => setEnabled({})}>Ни одного</button>
          </div>
        </fieldset>
        <div className={styles.pbResult}>
          <div className={styles.pbPromptHead}>
            <span>Запрос</span>
            <button type="button" className={styles.xpButton} onClick={copy}>{copied ? "Скопировано" : "Копировать"}</button>
          </div>
          <pre className={styles.pbPrompt}>{prompt}</pre>
          {off.length > 0 ? (
            <div className={styles.pbGuesses}>
              <b>Что модель додумает сама</b>
              <ul>
                {off.map(block => (
                  <li key={block.id}><span>{block.label}:</span> {block.guess}</li>
                ))}
              </ul>
            </div>
          ) : (
            <p className={styles.pbDone}>Все шесть блоков на месте — модели почти нечего додумывать.</p>
          )}
        </div>
      </div>
    </div>
  );
}
