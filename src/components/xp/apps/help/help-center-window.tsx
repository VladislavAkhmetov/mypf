"use client";

import React, { useState } from "react";
import { helpTopics, getHelpTopic, type HelpTopic } from "@/data/help-topics";
import { site } from "@/data/site";
import { xpSound } from "@/lib/xp/sound";
import { useWindowManager } from "../../window-manager-context";
import { HomeIcon, NavArrow, TopicIcon } from "./help-icons";
import { NodeSandbox } from "./node-sandbox";
import { AutolayoutSandbox } from "./autolayout-sandbox";
import { PromptBuilder } from "./prompt-builder";
import styles from "./help-center.module.css";

// "Центр справки и поддержки" in the Windows XP style: explainers that make complex topics simple.

type Page = { kind: "home" } | { kind: "topic"; id: string } | { kind: "search"; query: string };

function Sandbox({ topic }: { topic: HelpTopic }) {
  if (topic.sandbox === "nodes") return <NodeSandbox />;
  if (topic.sandbox === "autolayout") return <AutolayoutSandbox />;
  return <PromptBuilder />;
}

/** Renders the cheat sheet as a PNG card and downloads it. */
function downloadCheatsheet(topic: HelpTopic) {
  const scale = 2;
  const width = 720;
  const rowH = 44;
  const height = 124 + topic.cheatsheet.length * rowH + 56;
  const canvas = document.createElement("canvas");
  canvas.width = width * scale;
  canvas.height = height * scale;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(scale, scale);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  const band = ctx.createLinearGradient(0, 0, width, 0);
  band.addColorStop(0, "#0a246a");
  band.addColorStop(1, "#3a6ea5");
  ctx.fillStyle = band;
  ctx.fillRect(0, 0, width, 84);
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 13px Tahoma, Arial, sans-serif";
  ctx.fillText("ПАМЯТКА", 32, 32);
  // Shrink long titles to fit the band.
  let titleSize = 22;
  do {
    ctx.font = `bold ${titleSize}px Tahoma, Arial, sans-serif`;
  } while (ctx.measureText(topic.title).width > width - 64 && --titleSize > 14);
  ctx.fillText(topic.title, 32, 62);
  topic.cheatsheet.forEach(([term, meaning], index) => {
    const y = 120 + index * rowH;
    if (index % 2 === 0) {
      ctx.fillStyle = "#eef3fb";
      ctx.fillRect(24, y - 26, width - 48, rowH);
    }
    ctx.fillStyle = "#003399";
    ctx.font = "bold 16px Tahoma, Arial, sans-serif";
    ctx.fillText(term, 40, y);
    ctx.fillStyle = "#222222";
    ctx.font = "16px Tahoma, Arial, sans-serif";
    ctx.fillText(meaning, 230, y);
  });
  ctx.fillStyle = "#6b7a90";
  ctx.font = "12px Tahoma, Arial, sans-serif";
  ctx.fillText(`${site.name} · Центр справки и поддержки`, 32, height - 24);
  const link = document.createElement("a");
  link.href = canvas.toDataURL("image/png");
  link.download = `pamyatka-${topic.id}.png`;
  link.click();
}

export function HelpCenterWindow({ initialTopicId }: { initialTopicId?: string }) {
  const { openPortfolio, openNotes, openWindow } = useWindowManager();
  const [history, setHistory] = useState<Page[]>(() => [getHelpTopic(initialTopicId) ? { kind: "topic", id: initialTopicId! } : { kind: "home" }]);
  const [index, setIndex] = useState(0);
  const [query, setQuery] = useState("");
  const page = history[index];

  const go = (next: Page) => {
    xpSound.click();
    setHistory(prev => [...prev.slice(0, index + 1), next]);
    setIndex(i => i + 1);
  };
  const back = () => index > 0 && setIndex(i => i - 1);
  const forward = () => index < history.length - 1 && setIndex(i => i + 1);
  const search = (event: React.FormEvent) => {
    event.preventDefault();
    if (query.trim()) go({ kind: "search", query: query.trim() });
  };

  const topic = page.kind === "topic" ? getHelpTopic(page.id) : undefined;
  const results =
    page.kind === "search"
      ? helpTopics.filter(t =>
          [t.title, t.subtitle, t.why, t.model, ...t.mistakes, ...t.cheatsheet.flat()].join(" ").toLocaleLowerCase("ru").includes(page.query.toLocaleLowerCase("ru")),
        )
      : [];

  const openTools = () => {
    xpSound.click();
    openWindow({ id: "tools", type: "tools", title: "Инструменты", iconType: "tools", x: 80, y: 45, width: 760, height: 520 });
  };

  return (
    <div className={styles.help}>
      <header className={styles.banner}>
        <div className={styles.navButtons}>
          <button type="button" onClick={back} disabled={index === 0} aria-label="Назад">
            <NavArrow dir="back" /> <span>Назад</span>
          </button>
          <button type="button" onClick={forward} disabled={index >= history.length - 1} aria-label="Вперёд">
            <NavArrow dir="forward" />
          </button>
          <span className={styles.navSep} />
          <button type="button" onClick={() => go({ kind: "home" })} aria-label="Домой">
            <HomeIcon /> <span>Домой</span>
          </button>
        </div>
        <div className={styles.brand}>
          <b>Центр справки и поддержки</b>
          <span>Сложное — простыми словами</span>
        </div>
      </header>
      <form className={styles.searchBar} onSubmit={search} role="search">
        <label htmlFor="help-search">Найти:</label>
        <input id="help-search" value={query} onChange={e => setQuery(e.target.value)} placeholder="например, автолейаут" />
        <button type="submit" aria-label="Начать поиск"><NavArrow dir="forward" /></button>
      </form>

      <div className={styles.body} key={index}>
        {page.kind === "home" && (
          <div className={styles.home}>
            <section className={styles.homeMain}>
              <h2 className={styles.homeHeading}>Выберите раздел справки</h2>
              <ul className={styles.topicList}>
                {helpTopics.map(t => (
                  <li key={t.id}>
                    <button type="button" onClick={() => go({ kind: "topic", id: t.id })}>
                      <TopicIcon kind={t.sandbox} />
                      <span>
                        <b>{t.title}</b>
                        <small>{t.subtitle}</small>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
            <aside className={styles.homeSide}>
              <section>
                <h3 className={styles.sideHeading}>Попросите о помощи</h3>
                <a className={styles.sideLink} href={site.telegram} target="_blank" rel="noreferrer">Написать Владу в Telegram</a>
                <a className={styles.sideLink} href={`mailto:${site.email}`}>Отправить письмо</a>
              </section>
              <section>
                <h3 className={styles.sideHeading}>Выберите задачу</h3>
                <button type="button" className={styles.sideLink} onClick={() => { xpSound.click(); openPortfolio(); }}>Посмотреть кейсы</button>
                <button type="button" className={styles.sideLink} onClick={openTools}>Открыть инструменты</button>
                <button type="button" className={styles.sideLink} onClick={() => { xpSound.click(); openNotes(); }}>Почитать журнал</button>
              </section>
              <section className={styles.didYouKnow}>
                <h3>Знаете ли вы?</h3>
                <p>Почти любую сложную тему можно объяснить одной схемой и одной песочницей. Если у вас в продукте есть такая тема — напишите, разберём вместе.</p>
              </section>
            </aside>
          </div>
        )}

        {page.kind === "search" && (
          <div className={styles.article}>
            <p className={styles.crumbs}>Результаты поиска</p>
            <h1>«{page.query}»</h1>
            {results.length ? (
              <ul className={styles.topicList}>
                {results.map(t => (
                  <li key={t.id}>
                    <button type="button" onClick={() => go({ kind: "topic", id: t.id })}>
                      <TopicIcon kind={t.sandbox} />
                      <span><b>{t.title}</b><small>{t.subtitle}</small></span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p>Ничего не найдено. Попробуйте другое слово или <a href={site.telegram} target="_blank" rel="noreferrer">задайте вопрос в Telegram</a>.</p>
            )}
          </div>
        )}

        {topic && (
          <div className={styles.topicPage}>
            <nav className={styles.topicNav} aria-label="Разделы справки">
              <h3>Разделы справки</h3>
              {helpTopics.map(t => (
                <button key={t.id} type="button" className={t.id === topic.id ? styles.topicNavOn : ""} onClick={() => t.id !== topic.id && go({ kind: "topic", id: t.id })}>
                  <TopicIcon kind={t.sandbox} size={16} />
                  {t.title}
                </button>
              ))}
            </nav>
            <article className={styles.article}>
              <p className={styles.crumbs}>
                <button type="button" onClick={() => go({ kind: "home" })}>Домой</button> › {topic.title}
              </p>
              <h1>{topic.title}</h1>
              <p className={styles.lead}>{topic.subtitle}</p>

              <h2><i>1</i>Почему это сложно</h2>
              <p>{topic.why}</p>

              <h2><i>2</i>Простая модель</h2>
              <p>{topic.model}</p>
              <ol className={styles.principles}>
                {topic.principles.map(item => <li key={item}>{item}</li>)}
              </ol>

              <h2><i>3</i>Попробуйте сами</h2>
              <p>{topic.tryIt}</p>
              <Sandbox key={topic.id} topic={topic} />

              <h2><i>4</i>Частые ошибки</h2>
              <ul className={styles.mistakes}>
                {topic.mistakes.map(item => <li key={item}>{item}</li>)}
              </ul>

              <h2><i>5</i>Памятка</h2>
              <div className={styles.cheatsheet}>
                <table>
                  <tbody>
                    {topic.cheatsheet.map(([term, meaning]) => (
                      <tr key={term}><th>{term}</th><td>{meaning}</td></tr>
                    ))}
                  </tbody>
                </table>
                <button type="button" className={styles.xpButton} onClick={() => { xpSound.click(); downloadCheatsheet(topic); }}>
                  Сохранить памятку (PNG)
                </button>
              </div>

              <div className={styles.related}>
                <h3>Связанные темы</h3>
                {topic.related.map(id => {
                  const rel = getHelpTopic(id);
                  return rel ? (
                    <button key={id} type="button" onClick={() => go({ kind: "topic", id })}>{rel.title}</button>
                  ) : null;
                })}
              </div>
            </article>
          </div>
        )}
      </div>
    </div>
  );
}
