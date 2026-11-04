"use client";

import React, { useState } from "react";
import { helpTopicsFor, getHelpTopic, type HelpTopic } from "@/data/help-topics";
import { site } from "@/data/site";
import { xpSound } from "@/lib/xp/sound";
import { useWindowManager } from "../../window-manager-context";
import { HomeIcon, NavArrow, TopicIcon } from "./help-icons";
import { NodeSandbox } from "./node-sandbox";
import { AutolayoutSandbox } from "./autolayout-sandbox";
import { PromptBuilder } from "./prompt-builder";
import styles from "./help-center.module.css";
import { useLocale } from "@/lib/i18n";

// tr("Центр справки и поддержки", "Help and Support Center") in the Windows XP style: explainers that make complex topics simple.

type Page = { kind: "home" } | { kind: "topic"; id: string } | { kind: "search"; query: string };


type Tr = (ru: string, en: string) => string;

function Sandbox({ topic }: { topic: HelpTopic }) {
  if (topic.sandbox === "nodes") return <NodeSandbox />;
  if (topic.sandbox === "autolayout") return <AutolayoutSandbox />;
  return <PromptBuilder />;
}

/** Renders the cheat sheet as a PNG card and downloads it. */
function downloadCheatsheet(topic: HelpTopic, tr: Tr) {
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
  ctx.fillText(tr("ПАМЯТКА", "CHEAT SHEET"), 32, 32);
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
  ctx.fillText(`${tr(site.name, site.nameEn)} · ${tr("Центр справки и поддержки", "Help and Support Center")}`, 32, height - 24);
  const link = document.createElement("a");
  link.href = canvas.toDataURL("image/png");
  link.download = `pamyatka-${topic.id}.png`;
  link.click();
}

export function HelpCenterWindow({ initialTopicId }: { initialTopicId?: string }) {
  const { tr, locale } = useLocale();
  const helpTopics = helpTopicsFor(locale);
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

  const topic = page.kind === "topic" ? getHelpTopic(page.id, locale) : undefined;
  const results =
    page.kind === "search"
      ? helpTopics.filter(t =>
          [t.title, t.subtitle, t.why, t.model, ...t.mistakes, ...t.cheatsheet.flat()].join(" ").toLocaleLowerCase(locale).includes(page.query.toLocaleLowerCase(locale)),
        )
      : [];

  const openTools = () => {
    xpSound.click();
    openWindow({ id: "tools", type: "tools", title: tr("Инструменты", "Tools"), iconType: "tools", x: 80, y: 45, width: 760, height: 520 });
  };

  return (
    <div className={styles.help}>
      <header className={styles.banner}>
        <div className={styles.navButtons}>
          <button type="button" onClick={back} disabled={index === 0} aria-label={tr("Назад", "Back")}>
            <NavArrow dir="back" /> <span>{tr("Назад", "Back")}</span>
          </button>
          <button type="button" onClick={forward} disabled={index >= history.length - 1} aria-label={tr("Вперёд", "Forward")}>
            <NavArrow dir="forward" />
          </button>
          <span className={styles.navSep} />
          <button type="button" onClick={() => go({ kind: "home" })} aria-label={tr("Домой", "Home")}>
            <HomeIcon /> <span>{tr("Домой", "Home")}</span>
          </button>
        </div>
        <div className={styles.brand}>
          <b>{tr("Центр справки и поддержки", "Help and Support Center")}</b>
          <span>{tr("Сложное — простыми словами", "Complex things in simple words")}</span>
        </div>
      </header>
      <form className={styles.searchBar} onSubmit={search} role="search">
        <label htmlFor="help-search">{tr("Найти:", "Search:")}</label>
        <input id="help-search" value={query} onChange={e => setQuery(e.target.value)} placeholder={tr("например, автолейаут", "e.g. auto layout")} />
        <button type="submit" aria-label={tr("Начать поиск", "Start search")}><NavArrow dir="forward" /></button>
      </form>

      <div className={styles.body} key={index}>
        {page.kind === "home" && (
          <div className={styles.home}>
            <section className={styles.homeMain}>
              <h2 className={styles.homeHeading}>{tr("Выберите раздел справки", "Choose a help topic")}</h2>
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
                <h3 className={styles.sideHeading}>{tr("Попросите о помощи", "Ask for help")}</h3>
                <a className={styles.sideLink} href={site.telegram} target="_blank" rel="noreferrer">{tr("Написать Владу в Telegram", "Message Vlad on Telegram")}</a>
                <a className={styles.sideLink} href={`mailto:${site.email}`}>{tr("Отправить письмо", "Send an email")}</a>
              </section>
              <section>
                <h3 className={styles.sideHeading}>{tr("Выберите задачу", "Pick a task")}</h3>
                <button type="button" className={styles.sideLink} onClick={() => { xpSound.click(); openPortfolio(); }}>{tr("Посмотреть кейсы", "See case studies")}</button>
                <button type="button" className={styles.sideLink} onClick={openTools}>{tr("Открыть инструменты", "Open tools")}</button>
                <button type="button" className={styles.sideLink} onClick={() => { xpSound.click(); openNotes(); }}>{tr("Почитать журнал", "Read the journal")}</button>
              </section>
              <section className={styles.didYouKnow}>
                <h3>{tr("Знаете ли вы?", "Did you know?")}</h3>
                <p>{tr("Почти любую сложную тему можно объяснить одной схемой и одной песочницей. Если у вас в продукте есть такая тема — напишите, разберём вместе.", "Almost any complex topic can be explained with one diagram and one sandbox. If your product has a topic like that, write to me and we will work it out together.")}</p>
              </section>
            </aside>
          </div>
        )}

        {page.kind === "search" && (
          <div className={styles.article}>
            <p className={styles.crumbs}>{tr("Результаты поиска", "Search results")}</p>
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
              <p>{tr("Ничего не найдено. Попробуйте другое слово или", "Nothing found. Try another word or")} <a href={site.telegram} target="_blank" rel="noreferrer">{tr("задайте вопрос в Telegram", "ask on Telegram")}</a>.</p>
            )}
          </div>
        )}

        {topic && (
          <div className={styles.topicPage}>
            <nav className={styles.topicNav} aria-label={tr("Разделы справки", "Help topics")}>
              <h3>{tr("Разделы справки", "Help topics")}</h3>
              {helpTopics.map(t => (
                <button key={t.id} type="button" className={t.id === topic.id ? styles.topicNavOn : ""} onClick={() => t.id !== topic.id && go({ kind: "topic", id: t.id })}>
                  <TopicIcon kind={t.sandbox} size={16} />
                  {t.title}
                </button>
              ))}
            </nav>
            <article className={styles.article}>
              <p className={styles.crumbs}>
                <button type="button" onClick={() => go({ kind: "home" })}>{tr("Домой", "Home")}</button> › {topic.title}
              </p>
              <h1>{topic.title}</h1>
              <p className={styles.lead}>{topic.subtitle}</p>

              <h2><i>1</i>{tr("Почему это сложно", "Why it is hard")}</h2>
              <p>{topic.why}</p>

              <h2><i>2</i>{tr("Простая модель", "A simple model")}</h2>
              <p>{topic.model}</p>
              <ol className={styles.principles}>
                {topic.principles.map(item => <li key={item}>{item}</li>)}
              </ol>

              <h2><i>3</i>{tr("Попробуйте сами", "Try it yourself")}</h2>
              <p>{topic.tryIt}</p>
              <Sandbox key={topic.id} topic={topic} />

              <h2><i>4</i>{tr("Частые ошибки", "Common mistakes")}</h2>
              <ul className={styles.mistakes}>
                {topic.mistakes.map(item => <li key={item}>{item}</li>)}
              </ul>

              <h2><i>5</i>{tr("Памятка", "Cheat sheet")}</h2>
              <div className={styles.cheatsheet}>
                <table>
                  <tbody>
                    {topic.cheatsheet.map(([term, meaning]) => (
                      <tr key={term}><th>{term}</th><td>{meaning}</td></tr>
                    ))}
                  </tbody>
                </table>
                <button type="button" className={styles.xpButton} onClick={() => { xpSound.click(); downloadCheatsheet(topic, tr); }}>
                  {tr("Сохранить памятку (PNG)", "Save cheat sheet (PNG)")}
                </button>
              </div>

              <div className={styles.related}>
                <h3>{tr("Связанные темы", "Related topics")}</h3>
                {topic.related.map(id => {
                  const rel = getHelpTopic(id, locale);
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
