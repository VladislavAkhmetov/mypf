"use client";

import React, { useMemo, useState } from "react";
import { toolsFor, ToolItem, ToolPlatform } from "@/data/tools";
import { useWindowManager } from "../window-manager-context";
import { xpSound } from "@/lib/xp/sound";
import { FolderIcon, ToolFileIcon, ToolbarGlyphIcon } from "./tools-icons";
import styles from "./tools-window.module.css";
import { useLocale } from "@/lib/i18n";

type Tr = (ru: string, en: string) => string;

// tr("Инструменты", "Tools") as a Windows XP Explorer folder: menu, toolbar, address bar, blue task
// pane, Tiles view grouped by type, and a classic Properties dialog for each file.

const groupsFor = (tr: Tr): Array<{ id: ToolPlatform; label: string; type: string }> => [
  { id: "figma", label: tr("Плагины Figma", "Figma plugins"), type: tr("Плагин Figma", "Figma plugin") },
  { id: "illustrator", label: tr("Сценарии Illustrator", "Illustrator scripts"), type: tr("Сценарий Illustrator (JSX)", "Illustrator script (JSX)") },
  { id: "web", label: tr("Веб-приложения", "Web apps"), type: tr("Веб-приложение", "Web app") },
  { id: "template", label: tr("Шаблоны", "Templates"), type: tr("Шаблон Figma", "Figma template") },
];


type Tab = "general" | "details" | "setup";

function TaskGroup({ title, open, onToggle, children, special = false }: { title: string; open: boolean; onToggle: () => void; children: React.ReactNode; special?: boolean }) {
  return (
    <section className={`${styles.taskGroup} ${special ? styles.taskGroupSpecial : ""}`}>
      <button type="button" className={styles.taskHeader} onClick={onToggle} aria-expanded={open}>
        <span>{title}</span>
        <i className={open ? styles.chevronUp : styles.chevronDown} aria-hidden="true" />
      </button>
      {open && <div className={styles.taskBody}>{children}</div>}
    </section>
  );
}

export function ToolsWindow() {
  const { openProject, openPortfolio, openNotes, openProfile } = useWindowManager();
  const { tr, locale } = useLocale();
  const toolsList = useMemo(() => toolsFor(locale), [locale]);
  const GROUPS = groupsFor(tr);
  const typeOf = (platform: ToolPlatform) => GROUPS.find(group => group.id === platform)?.type ?? tr("Файл", "File");
  const formatDate = (iso: string) => new Date(iso).toLocaleDateString(locale === "en" ? "en-US" : "ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });
  const [filter, setFilter] = useState<"all" | ToolPlatform>("all");
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"tiles" | "details">("tiles");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [propertiesId, setPropertiesId] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("general");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const visible = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("ru");
    return toolsList.filter(
      tool =>
        (filter === "all" || tool.platform === filter) &&
        (!q || `${tool.title} ${tool.tagline} ${tool.problem} ${tool.solution}`.toLocaleLowerCase("ru").includes(q)),
    );
  }, [filter, query, toolsList]);

  const selected = toolsList.find(tool => tool.id === selectedId) ?? null;
  const properties = toolsList.find(tool => tool.id === propertiesId) ?? null;
  const folderName = filter === "all" ? tr("Инструменты", "Tools") : GROUPS.find(group => group.id === filter)!.label;

  const runPrimary = (tool: ToolItem) => {
    xpSound.click();
    if (tool.primaryAction.url) window.open(tool.primaryAction.url, "_blank", "noopener,noreferrer");
  };

  const openProperties = (tool: ToolItem, nextTab: Tab = "general") => {
    xpSound.click();
    setSelectedId(tool.id);
    setTab(nextTab);
    setPropertiesId(tool.id);
  };

  const toggleGroup = (key: string) => setCollapsed(prev => ({ ...prev, [key]: !prev[key] }));

  const tile = (tool: ToolItem) => (
    <button
      type="button"
      key={tool.id}
      className={`${styles.tile} ${selectedId === tool.id ? styles.selected : ""}`}
      onClick={() => setSelectedId(tool.id)}
      onDoubleClick={() => openProperties(tool)}
      onKeyDown={event => {
        if (event.key === "Enter") openProperties(tool);
      }}
      aria-label={`${tool.title}, ${typeOf(tool.platform)}`}
    >
      <span className={styles.tileIcon}><ToolFileIcon platform={tool.platform} /></span>
      <span className={styles.tileText}>
        <b>{tool.title}</b>
        <span>{typeOf(tool.platform)}</span>
        <span>{tool.version} · {formatDate(tool.updatedAt)}</span>
      </span>
    </button>
  );

  return (
    <div className={styles.window}>
      <nav className={styles.menuBar} aria-label={tr("Меню", "Menu")}>
        {[tr("Файл", "File"), tr("Правка", "Edit"), tr("Вид", "View"), tr("Избранное", "Favorites"), tr("Сервис", "Tools"), tr("Справка", "Help")].map(item => (
          <span key={item}><u>{item[0]}</u>{item.slice(1)}</span>
        ))}
      </nav>

      <div className={styles.toolbar}>
        <button type="button" className={styles.toolButton} disabled={filter === "all"} onClick={() => { xpSound.click(); setFilter("all"); }}>
          <ToolbarGlyphIcon name="back" /><span>{tr("Назад", "Back")}</span>
        </button>
        <button type="button" className={styles.toolButton} disabled aria-label={tr("Вперёд", "Forward")}>
          <ToolbarGlyphIcon name="forward" />
        </button>
        <button type="button" className={styles.toolButton} disabled={filter === "all"} onClick={() => { xpSound.click(); setFilter("all"); }} aria-label={tr("Вверх", "Up")}>
          <ToolbarGlyphIcon name="up" />
        </button>
        <span className={styles.toolSeparator} />
        <label className={styles.searchField}>
          <ToolbarGlyphIcon name="search" />
          <input value={query} onChange={event => setQuery(event.target.value)} placeholder={tr("Поиск", "Search")} aria-label={tr("Поиск по инструментам", "Search tools")} />
        </label>
        <span className={styles.toolSeparator} />
        <button type="button" className={`${styles.toolButton} ${view === "tiles" ? styles.toolPressed : ""}`} onClick={() => { xpSound.click(); setView("tiles"); }} aria-pressed={view === "tiles"}>
          <ToolbarGlyphIcon name="views" /><span>{tr("Плитка", "Tiles")}</span>
        </button>
        <button type="button" className={`${styles.toolButton} ${view === "details" ? styles.toolPressed : ""}`} onClick={() => { xpSound.click(); setView("details"); }} aria-pressed={view === "details"}>
          <ToolbarGlyphIcon name="folders" /><span>{tr("Таблица", "Table")}</span>
        </button>
      </div>

      <div className={styles.addressBar}>
        <span className={styles.addressLabel}>{tr("Адрес", "Address")}</span>
        <div className={styles.addressField}>
          <FolderIcon />
          <span>C:\Program Files\Amazi\{folderName}</span>
        </div>
        <button type="button" className={styles.goButton} onClick={() => xpSound.click()}>
          <ToolbarGlyphIcon name="forward" /> {tr("Переход", "Go")}
        </button>
      </div>

      <div className={styles.body}>
        <aside className={styles.taskPane}>
          {selected ? (
            <TaskGroup open={!collapsed.file} onToggle={() => toggleGroup("file")} title={tr("Задачи для файлов", "File tasks")} special>
              <button type="button" className={styles.taskLink} onClick={() => openProperties(selected)}>{tr("Открыть свойства", "Open properties")}</button>
              <button type="button" className={styles.taskLink} onClick={() => runPrimary(selected)}>{selected.primaryAction.label}</button>
              <button type="button" className={styles.taskLink} onClick={() => openProperties(selected, "setup")}>{tr("Как установить", "How to install")}</button>
              {selected.caseStudySlug && (
                <button type="button" className={styles.taskLink} onClick={() => { xpSound.click(); openProject(selected.caseStudySlug!); }}>{tr("Открыть связанный кейс", "Open related case")}</button>
              )}
            </TaskGroup>
          ) : (
            <TaskGroup open={!collapsed.folder} onToggle={() => toggleGroup("folder")} title={tr("Задачи для папки", "Folder tasks")} special>
              <span className={styles.taskHint}>{tr("Выберите файл, чтобы увидеть действия. Двойной щелчок открывает свойства.", "Select a file to see actions. Double-click opens its properties.")}</span>
            </TaskGroup>
          )}

          <TaskGroup open={!collapsed.types} onToggle={() => toggleGroup("types")} title={tr("Типы файлов", "File types")}>
            <button type="button" className={`${styles.taskLink} ${filter === "all" ? styles.taskLinkActive : ""}`} onClick={() => { xpSound.click(); setFilter("all"); }}>
              <FolderIcon /> Все инструменты ({toolsList.length})
            </button>
            {GROUPS.filter(group => toolsList.some(tool => tool.platform === group.id)).map(group => (
              <button type="button" key={group.id} className={`${styles.taskLink} ${filter === group.id ? styles.taskLinkActive : ""}`} onClick={() => { xpSound.click(); setFilter(group.id); }}>
                <ToolFileIcon platform={group.id} size={16} /> {group.label}
              </button>
            ))}
          </TaskGroup>

          <TaskGroup open={!collapsed.places} onToggle={() => toggleGroup("places")} title={tr("Другие места", "Other places")}>
            <button type="button" className={styles.taskLink} onClick={() => { xpSound.click(); openPortfolio(); }}>{tr("Портфолио", "Portfolio")}</button>
            <button type="button" className={styles.taskLink} onClick={() => { xpSound.click(); openNotes(); }}>{tr("Журнал", "Journal")}</button>
            <button type="button" className={styles.taskLink} onClick={() => { xpSound.click(); openProfile(); }}>{tr("Обо мне", "About me")}</button>
          </TaskGroup>

          <TaskGroup open={!collapsed.details} onToggle={() => toggleGroup("details")} title={tr("Подробно", "Details")}>
            {selected ? (
              <div className={styles.detailsBlock}>
                <b>{selected.title}</b>
                <span>{typeOf(selected.platform)}</span>
                <span>Версия: {selected.version}</span>
                <span>Изменён: {formatDate(selected.updatedAt)}</span>
              </div>
            ) : (
              <div className={styles.detailsBlock}>
                <b>{folderName}</b>
                <span>{tr("Папка с файлами", "File folder")}</span>
                <span>Объектов: {visible.length}</span>
              </div>
            )}
          </TaskGroup>
        </aside>

        <main className={styles.content} onClick={event => { if (event.target === event.currentTarget) setSelectedId(null); }}>
          {visible.length === 0 && <p className={styles.empty}>{tr("Поиск завершён. Нет элементов для отображения.", "Search is complete. There are no results to display.")}</p>}
          {view === "tiles"
            ? GROUPS.filter(group => visible.some(tool => tool.platform === group.id)).map(group => (
                <section key={group.id} className={styles.group}>
                  <h3 className={styles.groupHeader}>{group.label}</h3>
                  <div className={styles.tiles}>{visible.filter(tool => tool.platform === group.id).map(tile)}</div>
                </section>
              ))
            : visible.length > 0 && (
                <table className={styles.detailsTable}>
                  <thead>
                    <tr><th>{tr("Имя", "Name")}</th><th>{tr("Тип", "Type")}</th><th>{tr("Версия", "Version")}</th><th>{tr("Изменён", "Modified")}</th></tr>
                  </thead>
                  <tbody>
                    {visible.map(tool => (
                      <tr
                        key={tool.id}
                        className={selectedId === tool.id ? styles.selectedRow : ""}
                        onClick={() => setSelectedId(tool.id)}
                        onDoubleClick={() => openProperties(tool)}
                      >
                        <td><span className={styles.nameCell}><ToolFileIcon platform={tool.platform} size={16} />{tool.title}</span></td>
                        <td>{typeOf(tool.platform)}</td>
                        <td>{tool.version}</td>
                        <td>{formatDate(tool.updatedAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
        </main>
      </div>

      <footer className={styles.statusBar}>
        <span>{selected ? `${tr("Тип", "Type")}: ${typeOf(selected.platform)}  ${tr("Изменён", "Modified")}: ${formatDate(selected.updatedAt)}` : `${tr("Объектов", "Objects")}: ${visible.length}`}</span>
        <span className={styles.statusZone}><FolderIcon /> {tr("Мой компьютер", "My Computer")}</span>
      </footer>

      {properties && (
        <div className={styles.dialogLayer} role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) setPropertiesId(null); }}>
          <section className={styles.dialog} role="dialog" aria-modal="true" aria-label={`${tr("Свойства", "Properties")}: ${properties.title}`}>
            <header className={styles.dialogTitle}>
              <span>Свойства: {properties.title}</span>
              <button type="button" className="xp-btn-ctrl xp-btn-close" onClick={() => setPropertiesId(null)} aria-label={tr("Закрыть свойства", "Close properties")}>
                <svg viewBox="0 0 10 10" width="10" height="10"><path d="M1 1l8 8M9 1L1 9" stroke="#fff" strokeWidth="1.8" /></svg>
              </button>
            </header>
            <div className={styles.dialogBody}>
              <div className={styles.tabs} role="tablist">
                {([["general", tr("Общие", "General")], ["details", tr("Описание", "Description")], ["setup", tr("Установка", "Setup")]] as Array<[Tab, string]>).map(([id, label]) => (
                  <button key={id} type="button" role="tab" aria-selected={tab === id} className={tab === id ? styles.tabActive : ""} onClick={() => { xpSound.click(); setTab(id); }}>
                    {label}
                  </button>
                ))}
              </div>
              <div className={styles.tabPanel} role="tabpanel">
                {tab === "general" && (
                  <>
                    <div className={styles.propHead}>
                      <ToolFileIcon platform={properties.platform} size={32} />
                      <input readOnly value={properties.title} aria-label={tr("Имя файла", "File name")} />
                    </div>
                    <hr />
                    <dl className={styles.propList}>
                      <dt>{tr("Тип файла:", "Type of file:")}</dt><dd>{typeOf(properties.platform)}</dd>
                      <dt>{tr("Описание:", "Description:")}</dt><dd>{properties.tagline}</dd>
                      <hr />
                      <dt>{tr("Версия:", "Version:")}</dt><dd>{properties.version}</dd>
                      <dt>{tr("Изменён:", "Modified:")}</dt><dd>{formatDate(properties.updatedAt)}</dd>
                      <dt>{tr("Совместимость:", "Compatibility:")}</dt><dd>{properties.compatibility}</dd>
                    </dl>
                  </>
                )}
                {tab === "details" && (
                  <div className={styles.propText}>
                    <fieldset>
                      <legend>{tr("Задача", "Task")}</legend>
                      <p>{properties.problem}</p>
                    </fieldset>
                    <fieldset>
                      <legend>{tr("Решение", "Solution")}</legend>
                      <p>{properties.solution}</p>
                    </fieldset>
                    <fieldset>
                      <legend>{tr("Возможности", "Features")}</legend>
                      <ul>{properties.highlights.map(item => <li key={item}>{item}</li>)}</ul>
                    </fieldset>
                  </div>
                )}
                {tab === "setup" && (
                  <div className={styles.propText}>
                    <fieldset>
                      <legend>{tr("Порядок установки", "Installation steps")}</legend>
                      <ol>{properties.instructions.map(item => <li key={item}>{item}</li>)}</ol>
                    </fieldset>
                    {properties.caseStudySlug && (
                      <button type="button" className={styles.linkButton} onClick={() => { xpSound.click(); openProject(properties.caseStudySlug!); }}>
                        {tr("Посмотреть, где применялся инструмент", "See where the tool was used")}
                      </button>
                    )}
                  </div>
                )}
              </div>
              <div className={styles.dialogButtons}>
                <button type="button" className={styles.xpButton} onClick={() => runPrimary(properties)}>{properties.primaryAction.label}</button>
                <span />
                <button type="button" className={`${styles.xpButton} ${styles.xpButtonDefault}`} onClick={() => { xpSound.click(); setPropertiesId(null); }}>{tr("ОК", "OK")}</button>
                <button type="button" className={styles.xpButton} onClick={() => setPropertiesId(null)}>{tr("Отмена", "Cancel")}</button>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
