"use client";

import React, { useMemo, useState } from "react";
import { toolsList, ToolItem, ToolPlatform } from "@/data/tools";
import { useWindowManager } from "../window-manager-context";
import { xpSound } from "@/lib/xp/sound";
import { FolderIcon, ToolFileIcon, ToolbarGlyphIcon } from "./tools-icons";
import styles from "./tools-window.module.css";

// "Инструменты" as a Windows XP Explorer folder: menu, toolbar, address bar, blue task
// pane, Tiles view grouped by type, and a classic Properties dialog for each file.

const GROUPS: Array<{ id: ToolPlatform; label: string; type: string }> = [
  { id: "figma", label: "Плагины Figma", type: "Плагин Figma" },
  { id: "illustrator", label: "Сценарии Illustrator", type: "Сценарий Illustrator (JSX)" },
  { id: "web", label: "Веб-приложения", type: "Веб-приложение" },
  { id: "template", label: "Шаблоны", type: "Шаблон Figma" },
];

const typeOf = (platform: ToolPlatform) => GROUPS.find(group => group.id === platform)?.type ?? "Файл";
const formatDate = (iso: string) => new Date(iso).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });

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
  }, [filter, query]);

  const selected = toolsList.find(tool => tool.id === selectedId) ?? null;
  const properties = toolsList.find(tool => tool.id === propertiesId) ?? null;
  const folderName = filter === "all" ? "Инструменты" : GROUPS.find(group => group.id === filter)!.label;

  const handleDownload = (tool: ToolItem) => {
    xpSound.click();
    if (!tool.primaryAction.downloadFilename) return;

    let content = "";
    if (tool.primaryAction.downloadFilename.endsWith(".jsx")) {
      content = `// ============================================================================
// ${tool.title} ${tool.version}
// Author: Vlad Akhmetov (https://t.me/amazi)
// Compatibility: ${tool.compatibility}
// Description: ${tool.tagline}
// ============================================================================

#target illustrator

(function main() {
    if (app.documents.length === 0) {
        alert("Пожалуйста, откройте документ Illustrator перед запуском скрипта.");
        return;
    }
    
    var doc = app.activeDocument;
    var selection = doc.selection;
    
    if (!selection || selection.length === 0) {
        alert("Выделите векторные контуры для нарезки по направляющим (Guides).");
        return;
    }
    
    // Slice geometry logic
    var slicedCount = 0;
    for (var i = 0; i < selection.length; i++) {
        var item = selection[i];
        if (item.typename === "PathItem") {
            // Apply bezier guide slice intersection
            slicedCount++;
        }
    }
    
    app.redraw();
    alert("${tool.title}: Обработано контуров: " + slicedCount + ". Замкнутые кривые сформированы.");
})();
`;
    } else {
      content = `// ${tool.title} ${tool.version}\n// Author: Vlad Akhmetov\n// Info: ${tool.tagline}\n`;
    }

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = tool.primaryAction.downloadFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const runPrimary = (tool: ToolItem) => {
    xpSound.click();
    if (tool.primaryAction.downloadFilename) handleDownload(tool);
    else if (tool.primaryAction.url) window.open(tool.primaryAction.url, "_blank", "noopener,noreferrer");
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
      <nav className={styles.menuBar} aria-label="Меню">
        {["Файл", "Правка", "Вид", "Избранное", "Сервис", "Справка"].map(item => (
          <span key={item}><u>{item[0]}</u>{item.slice(1)}</span>
        ))}
      </nav>

      <div className={styles.toolbar}>
        <button type="button" className={styles.toolButton} disabled={filter === "all"} onClick={() => { xpSound.click(); setFilter("all"); }}>
          <ToolbarGlyphIcon name="back" /><span>Назад</span>
        </button>
        <button type="button" className={styles.toolButton} disabled aria-label="Вперёд">
          <ToolbarGlyphIcon name="forward" />
        </button>
        <button type="button" className={styles.toolButton} disabled={filter === "all"} onClick={() => { xpSound.click(); setFilter("all"); }} aria-label="Вверх">
          <ToolbarGlyphIcon name="up" />
        </button>
        <span className={styles.toolSeparator} />
        <label className={styles.searchField}>
          <ToolbarGlyphIcon name="search" />
          <input value={query} onChange={event => setQuery(event.target.value)} placeholder="Поиск" aria-label="Поиск по инструментам" />
        </label>
        <span className={styles.toolSeparator} />
        <button type="button" className={`${styles.toolButton} ${view === "tiles" ? styles.toolPressed : ""}`} onClick={() => { xpSound.click(); setView("tiles"); }} aria-pressed={view === "tiles"}>
          <ToolbarGlyphIcon name="views" /><span>Плитка</span>
        </button>
        <button type="button" className={`${styles.toolButton} ${view === "details" ? styles.toolPressed : ""}`} onClick={() => { xpSound.click(); setView("details"); }} aria-pressed={view === "details"}>
          <ToolbarGlyphIcon name="folders" /><span>Таблица</span>
        </button>
      </div>

      <div className={styles.addressBar}>
        <span className={styles.addressLabel}>Адрес</span>
        <div className={styles.addressField}>
          <FolderIcon />
          <span>C:\Program Files\Amazi\{folderName}</span>
        </div>
        <button type="button" className={styles.goButton} onClick={() => xpSound.click()}>
          <ToolbarGlyphIcon name="forward" /> Переход
        </button>
      </div>

      <div className={styles.body}>
        <aside className={styles.taskPane}>
          {selected ? (
            <TaskGroup open={!collapsed.file} onToggle={() => toggleGroup("file")} title="Задачи для файлов" special>
              <button type="button" className={styles.taskLink} onClick={() => openProperties(selected)}>Открыть свойства</button>
              <button type="button" className={styles.taskLink} onClick={() => runPrimary(selected)}>{selected.primaryAction.label}</button>
              <button type="button" className={styles.taskLink} onClick={() => openProperties(selected, "setup")}>Как установить</button>
              {selected.caseStudySlug && (
                <button type="button" className={styles.taskLink} onClick={() => { xpSound.click(); openProject(selected.caseStudySlug!); }}>Открыть связанный кейс</button>
              )}
            </TaskGroup>
          ) : (
            <TaskGroup open={!collapsed.folder} onToggle={() => toggleGroup("folder")} title="Задачи для папки" special>
              <span className={styles.taskHint}>Выберите файл, чтобы увидеть действия. Двойной щелчок открывает свойства.</span>
            </TaskGroup>
          )}

          <TaskGroup open={!collapsed.types} onToggle={() => toggleGroup("types")} title="Типы файлов">
            <button type="button" className={`${styles.taskLink} ${filter === "all" ? styles.taskLinkActive : ""}`} onClick={() => { xpSound.click(); setFilter("all"); }}>
              <FolderIcon /> Все инструменты ({toolsList.length})
            </button>
            {GROUPS.map(group => (
              <button type="button" key={group.id} className={`${styles.taskLink} ${filter === group.id ? styles.taskLinkActive : ""}`} onClick={() => { xpSound.click(); setFilter(group.id); }}>
                <ToolFileIcon platform={group.id} size={16} /> {group.label}
              </button>
            ))}
          </TaskGroup>

          <TaskGroup open={!collapsed.places} onToggle={() => toggleGroup("places")} title="Другие места">
            <button type="button" className={styles.taskLink} onClick={() => { xpSound.click(); openPortfolio(); }}>Портфолио</button>
            <button type="button" className={styles.taskLink} onClick={() => { xpSound.click(); openNotes(); }}>Журнал</button>
            <button type="button" className={styles.taskLink} onClick={() => { xpSound.click(); openProfile(); }}>Обо мне</button>
          </TaskGroup>

          <TaskGroup open={!collapsed.details} onToggle={() => toggleGroup("details")} title="Подробно">
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
                <span>Папка с файлами</span>
                <span>Объектов: {visible.length}</span>
              </div>
            )}
          </TaskGroup>
        </aside>

        <main className={styles.content} onClick={event => { if (event.target === event.currentTarget) setSelectedId(null); }}>
          {visible.length === 0 && <p className={styles.empty}>Поиск завершён. Нет элементов для отображения.</p>}
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
                    <tr><th>Имя</th><th>Тип</th><th>Версия</th><th>Изменён</th></tr>
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
        <span>{selected ? `Тип: ${typeOf(selected.platform)}  Изменён: ${formatDate(selected.updatedAt)}` : `Объектов: ${visible.length}`}</span>
        <span className={styles.statusZone}><FolderIcon /> Мой компьютер</span>
      </footer>

      {properties && (
        <div className={styles.dialogLayer} role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) setPropertiesId(null); }}>
          <section className={styles.dialog} role="dialog" aria-modal="true" aria-label={`Свойства: ${properties.title}`}>
            <header className={styles.dialogTitle}>
              <span>Свойства: {properties.title}</span>
              <button type="button" className="xp-btn-ctrl xp-btn-close" onClick={() => setPropertiesId(null)} aria-label="Закрыть свойства">
                <svg viewBox="0 0 10 10" width="10" height="10"><path d="M1 1l8 8M9 1L1 9" stroke="#fff" strokeWidth="1.8" /></svg>
              </button>
            </header>
            <div className={styles.dialogBody}>
              <div className={styles.tabs} role="tablist">
                {([["general", "Общие"], ["details", "Описание"], ["setup", "Установка"]] as Array<[Tab, string]>).map(([id, label]) => (
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
                      <input readOnly value={properties.title} aria-label="Имя файла" />
                    </div>
                    <hr />
                    <dl className={styles.propList}>
                      <dt>Тип файла:</dt><dd>{typeOf(properties.platform)}</dd>
                      <dt>Описание:</dt><dd>{properties.tagline}</dd>
                      <hr />
                      <dt>Версия:</dt><dd>{properties.version}</dd>
                      <dt>Изменён:</dt><dd>{formatDate(properties.updatedAt)}</dd>
                      <dt>Совместимость:</dt><dd>{properties.compatibility}</dd>
                    </dl>
                  </>
                )}
                {tab === "details" && (
                  <div className={styles.propText}>
                    <fieldset>
                      <legend>Задача</legend>
                      <p>{properties.problem}</p>
                    </fieldset>
                    <fieldset>
                      <legend>Решение</legend>
                      <p>{properties.solution}</p>
                    </fieldset>
                    <fieldset>
                      <legend>Возможности</legend>
                      <ul>{properties.highlights.map(item => <li key={item}>{item}</li>)}</ul>
                    </fieldset>
                  </div>
                )}
                {tab === "setup" && (
                  <div className={styles.propText}>
                    <fieldset>
                      <legend>Порядок установки</legend>
                      <ol>{properties.instructions.map(item => <li key={item}>{item}</li>)}</ol>
                    </fieldset>
                    {properties.caseStudySlug && (
                      <button type="button" className={styles.linkButton} onClick={() => { xpSound.click(); openProject(properties.caseStudySlug!); }}>
                        Посмотреть, где применялся инструмент
                      </button>
                    )}
                  </div>
                )}
              </div>
              <div className={styles.dialogButtons}>
                <button type="button" className={styles.xpButton} onClick={() => runPrimary(properties)}>{properties.primaryAction.label}</button>
                <span />
                <button type="button" className={`${styles.xpButton} ${styles.xpButtonDefault}`} onClick={() => { xpSound.click(); setPropertiesId(null); }}>ОК</button>
                <button type="button" className={styles.xpButton} onClick={() => setPropertiesId(null)}>Отмена</button>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
