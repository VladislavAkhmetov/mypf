"use client";

import React, { useState, useEffect, useCallback } from "react";
import { resumeData, type ResumeData, type ResumeJob, type ResumeProjectItem } from "@/data/resume";
import { useLocale } from "@/lib/i18n";
import { xpSound } from "@/lib/xp/sound";
import { xpCursors } from "@/lib/xp/cursors";

const STORAGE_KEY = "vlad_resume_draft_v2";

export function ResumeWindow() {
  const { tr, locale } = useLocale();

  // Active data state
  const [data, setData] = useState<ResumeData>(resumeData);
  const [isEditing, setIsEditing] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [editLocale, setEditLocale] = useState<"ru" | "en">(locale);
  const [isJsonOpen, setIsJsonOpen] = useState(false);
  const [jsonDraft, setJsonDraft] = useState("");
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Check if hidden edit mode is requested (?edit=true in URL)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("edit") === "true") {
        setCanEdit(true);
      }
    }
  }, []);

  // Sync editLocale with global locale when not editing
  useEffect(() => {
    if (!isEditing) {
      setEditLocale(locale);
    }
  }, [locale, isEditing]);

  // Load saved draft from localStorage on mount (if available)
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.name && parsed.experience) {
            setData(parsed);
          }
        }
      } catch {
        // ignore
      }
    }
  }, []);

  const handlePrint = () => {
    xpSound.click();
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  // Save to project via Next.js API route
  const handleSave = useCallback(
    async (overrideData?: ResumeData) => {
      const payload = overrideData || data;
      setIsSaving(true);
      setSaveMessage(null);
      xpSound.click();

      try {
        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
        }

        const res = await fetch("/api/save-resume", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const resJson = await res.json();

        if (resJson.ok) {
          setSaveMessage(tr("✓ Сохранено в проекте", "✓ Saved in project"));
        } else {
          setSaveMessage(tr("Сохранено локально в браузере", "Saved locally in browser"));
        }
      } catch {
        setSaveMessage(tr("Сохранено в браузере", "Saved in browser"));
      } finally {
        setIsSaving(false);
        setTimeout(() => setSaveMessage(null), 4000);
      }
    },
    [data, tr],
  );

  // Keyboard shortcut Ctrl+S (only if canEdit is enabled)
  useEffect(() => {
    if (!canEdit) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [canEdit, handleSave]);

  // Field update handlers
  const updateName = (val: string) => {
    setData((prev) => ({
      ...prev,
      name: { ...prev.name, [editLocale]: val },
    }));
  };

  const updateRole = (val: string) => {
    setData((prev) => ({
      ...prev,
      role: { ...prev.role, [editLocale]: val },
    }));
  };

  const updateLocation = (val: string) => {
    setData((prev) => ({
      ...prev,
      location: { ...prev.location, [editLocale]: val },
    }));
  };

  const updateSummary = (val: string) => {
    setData((prev) => ({
      ...prev,
      summary: { ...prev.summary, [editLocale]: val },
    }));
  };

  const updateJob = (jobIdx: number, field: "company" | "role" | "period", val: string) => {
    setData((prev) => {
      const exp = [...prev.experience];
      exp[jobIdx] = {
        ...exp[jobIdx],
        [field]: { ...exp[jobIdx][field], [editLocale]: val },
      };
      return { ...prev, experience: exp };
    });
  };

  const updateBullet = (jobIdx: number, bulletIdx: number, val: string) => {
    setData((prev) => {
      const exp = [...prev.experience];
      const bullets = [...exp[jobIdx].bullets];
      bullets[bulletIdx] = { ...bullets[bulletIdx], [editLocale]: val };
      exp[jobIdx] = { ...exp[jobIdx], bullets };
      return { ...prev, experience: exp };
    });
  };

  const addBullet = (jobIdx: number) => {
    xpSound.click();
    setData((prev) => {
      const exp = [...prev.experience];
      const bullets = [...exp[jobIdx].bullets, { ru: "Новый пункт обязанностей или достижений", en: "New responsibility or achievement bullet" }];
      exp[jobIdx] = { ...exp[jobIdx], bullets };
      return { ...prev, experience: exp };
    });
  };

  const removeBullet = (jobIdx: number, bulletIdx: number) => {
    xpSound.recycle();
    setData((prev) => {
      const exp = [...prev.experience];
      const bullets = exp[jobIdx].bullets.filter((_, idx) => idx !== bulletIdx);
      exp[jobIdx] = { ...exp[jobIdx], bullets };
      return { ...prev, experience: exp };
    });
  };

  const addJob = () => {
    xpSound.click();
    const newJob: ResumeJob = {
      period: { ru: "2024 — н. в.", en: "2024 — present" },
      company: { ru: "Новая компания / Проект", en: "New Company / Project" },
      role: { ru: "Дизайнер", en: "Designer" },
      bullets: [{ ru: "Описание задач и результатов", en: "Scope of responsibilities and achievements" }],
    };
    setData((prev) => ({ ...prev, experience: [newJob, ...prev.experience] }));
  };

  const removeJob = (jobIdx: number) => {
    xpSound.recycle();
    setData((prev) => ({
      ...prev,
      experience: prev.experience.filter((_, idx) => idx !== jobIdx),
    }));
  };

  const updateProject = (projIdx: number, field: "title" | "tagline" | "description" | "link", val: string) => {
    setData((prev) => {
      const projects = [...prev.projects];
      if (field === "title" || field === "link") {
        projects[projIdx] = { ...projects[projIdx], [field]: val };
      } else {
        projects[projIdx] = {
          ...projects[projIdx],
          [field]: { ...projects[projIdx][field], [editLocale]: val },
        };
      }
      return { ...prev, projects };
    });
  };

  const addProject = () => {
    xpSound.click();
    const newProj: ResumeProjectItem = {
      title: "Новый проект",
      tagline: { ru: "Краткое описание", en: "Short summary" },
      description: { ru: "Подробности и результат", en: "Details and outcome" },
    };
    setData((prev) => ({ ...prev, projects: [...prev.projects, newProj] }));
  };

  const removeProject = (projIdx: number) => {
    xpSound.recycle();
    setData((prev) => ({
      ...prev,
      projects: prev.projects.filter((_, idx) => idx !== projIdx),
    }));
  };

  const updateSkill = (field: "specialization" | "tools" | "code" | "ai", val: string) => {
    setData((prev) => {
      const currentField = prev.skills[field] || { ru: "", en: "" };
      return {
        ...prev,
        skills: {
          ...prev.skills,
          [field]: { ...currentField, [editLocale]: val },
        },
      };
    });
  };

  const handleOpenJsonEditor = () => {
    xpSound.click();
    setJsonDraft(JSON.stringify(data, null, 2));
    setJsonError(null);
    setIsJsonOpen(true);
  };

  const handleApplyJson = () => {
    try {
      const parsed = JSON.parse(jsonDraft);
      if (!parsed || !parsed.name || !parsed.experience) {
        throw new Error("Неверная структура JSON резюме");
      }
      setData(parsed);
      setIsJsonOpen(false);
      handleSave(parsed);
    } catch (err: unknown) {
      setJsonError(err instanceof Error ? err.message : "Ошибка синтаксиса JSON");
    }
  };

  const currentName = data.name[editLocale] || data.name.ru;
  const currentRole = data.role[editLocale] || data.role.ru;
  const currentLocation = data.location[editLocale] || data.location.ru;
  const currentSummary = data.summary[editLocale] || data.summary.ru;

  return (
    <div className="flex-1 flex flex-col bg-[#525659] print:bg-white text-black overflow-hidden print:overflow-visible select-text font-sans">
      {/* XP Acrobat-style Menu / Action Bar */}
      <div className="xp-menu-bar flex flex-wrap items-center justify-between text-xs px-2.5 py-1 bg-[#ece9d8] border-b border-[#999] gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Download standalone PDF button */}
          <a
            href="/resume_vlad_akhmetov.pdf"
            download="Резюме_Влад_Ахметов.pdf"
            className="xp-menu-item bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1 rounded-sm shadow-sm transition flex items-center gap-1.5"
            style={{ cursor: xpCursors.pointer }}
            title={tr("Скачать готовый отдельный файл PDF", "Download standalone PDF file")}
          >
            <span>📥</span>
            <span>{tr("Скачать PDF", "Download PDF")}</span>
          </a>

          {/* Print button */}
          <button
            type="button"
            onClick={handlePrint}
            className="xp-menu-item font-semibold text-slate-900 hover:bg-[#316ac5] hover:text-white px-2.5 py-1 rounded-sm transition flex items-center gap-1.5"
            style={{ cursor: xpCursors.pointer }}
            title={tr("Распечатать или сохранить как PDF через браузер", "Print or save as PDF via browser")}
          >
            <span>🖨️</span>
            <span>{tr("Печать / PDF", "Print / PDF")}</span>
          </button>

          {/* Live site link */}
          <a
            href="https://vladakhmetov.com"
            target="_blank"
            rel="noreferrer"
            className="xp-menu-item text-slate-800 hover:bg-[#316ac5] hover:text-white px-2.5 py-1 rounded-sm transition flex items-center gap-1"
            style={{ cursor: xpCursors.pointer }}
          >
            <span>vladakhmetov.com</span>
            <span>↗</span>
          </a>

          {/* Hidden admin/editor controls (only visible if ?edit=true in URL) */}
          {canEdit && (
            <>
              <button
                type="button"
                onClick={() => {
                  xpSound.click();
                  setIsEditing(!isEditing);
                }}
                className={`xp-menu-item px-2.5 py-1 rounded-sm transition flex items-center gap-1.5 font-bold ${
                  isEditing ? "bg-[#316ac5] text-white" : "text-slate-900 hover:bg-[#316ac5] hover:text-white"
                }`}
                style={{ cursor: xpCursors.pointer }}
              >
                <span>{isEditing ? "👁️" : "✏️"}</span>
                <span>{isEditing ? tr("Просмотр", "Preview") : tr("Редактировать", "Edit text")}</span>
              </button>

              <button
                type="button"
                onClick={() => handleSave()}
                disabled={isSaving}
                className="xp-menu-item bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-3 py-1 rounded-sm shadow-sm transition flex items-center gap-1.5 disabled:opacity-50"
                style={{ cursor: xpCursors.pointer }}
                title="Ctrl + S"
              >
                <span>💾</span>
                <span>{isSaving ? tr("...", "...") : tr("Сохранить", "Save")}</span>
              </button>

              <button
                type="button"
                onClick={handleOpenJsonEditor}
                className="xp-menu-item text-slate-800 hover:bg-[#316ac5] hover:text-white px-2 py-1 rounded-sm transition flex items-center gap-1"
                style={{ cursor: xpCursors.pointer }}
              >
                <span>📄 JSON</span>
              </button>

              {isEditing && (
                <div className="flex items-center gap-1 pl-2 border-l border-slate-300 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setEditLocale("ru")}
                    className={`px-1.5 py-0.5 rounded font-bold ${editLocale === "ru" ? "bg-blue-600 text-white" : "text-slate-800"}`}
                    style={{ cursor: xpCursors.pointer }}
                  >
                    RU
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditLocale("en")}
                    className={`px-1.5 py-0.5 rounded font-bold ${editLocale === "en" ? "bg-blue-600 text-white" : "text-slate-800"}`}
                    style={{ cursor: xpCursors.pointer }}
                  >
                    EN
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Right side info */}
        <div className="flex items-center gap-3 text-slate-600 text-[11px] pr-2">
          {saveMessage && (
            <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded animate-pulse">
              {saveMessage}
            </span>
          )}
          <span className="hidden sm:inline">{tr("Формат: 1 стр. A4 (210 × 297 мм)", "Format: 1 page A4 (210 × 297 mm)")}</span>
        </div>
      </div>

      {/* Document Scroll Area */}
      <div className="flex-1 overflow-y-auto print:overflow-visible p-4 sm:p-6 md:p-10 print:p-0 print:m-0 flex print:block justify-center bg-[#525659] print:bg-white">
        {/* Printable Single-Page A4 Paper Sheet */}
        <article
          id="resume-document"
          className="w-full max-w-[800px] print:max-w-none print:w-full bg-white text-neutral-950 p-6 sm:p-10 md:p-12 print:p-0 print:m-0 shadow-[0_4px_30px_rgba(0,0,0,0.45)] print:shadow-none min-h-[1050px] print:min-h-0 self-start text-left relative"
        >
          {/* Header */}
          <header className="space-y-2">
            <h1
              contentEditable={isEditing}
              suppressContentEditableWarning
              onBlur={(e) => updateName(e.currentTarget.textContent || "")}
              className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-950 leading-none outline-none"
            >
              {currentName}
            </h1>

            <div
              contentEditable={isEditing}
              suppressContentEditableWarning
              onBlur={(e) => updateRole(e.currentTarget.textContent || "")}
              className="text-base sm:text-lg font-medium text-neutral-800 outline-none"
            >
              {currentRole}
            </div>

            {/* Contacts & Metadata */}
            <div className="pt-0.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-neutral-600">
              <span
                contentEditable={isEditing}
                suppressContentEditableWarning
                onBlur={(e) => updateLocation(e.currentTarget.textContent || "")}
                className="outline-none"
              >
                {currentLocation}
              </span>

              <span className="text-neutral-300">•</span>

              <a
                href={data.contacts.telegram.url}
                target="_blank"
                rel="noreferrer"
                className="text-blue-700 hover:text-blue-900 hover:underline"
              >
                Telegram: {data.contacts.telegram.handle}
              </a>

              <span className="text-neutral-300">•</span>

              <a
                href={data.contacts.email.url}
                className="text-blue-700 hover:text-blue-900 hover:underline"
              >
                {data.contacts.email.address}
              </a>

              <span className="text-neutral-300">•</span>

              <a
                href={data.contacts.portfolio.url}
                target="_blank"
                rel="noreferrer"
                className="text-blue-700 hover:text-blue-900 hover:underline"
              >
                {data.contacts.portfolio.display}
              </a>
            </div>

            {/* Statement */}
            <p
              contentEditable={isEditing}
              suppressContentEditableWarning
              onBlur={(e) => updateSummary(e.currentTarget.textContent || "")}
              className="pt-2 text-[13.5px] sm:text-[14px] leading-[1.48] text-neutral-800 outline-none"
            >
              {currentSummary}
            </p>
          </header>

          {/* Main Content: Clean Single-Column Swiss Editorial Layout */}
          <div className="mt-6 space-y-6">
            {/* Section: Experience */}
            <section className="space-y-3.5">
              <div className="flex items-center justify-between mb-3 print:mb-2">
                <h2 className="text-[11px] font-bold uppercase tracking-[0.16em] text-neutral-500 select-none">
                  {tr("Опыт работы", "Experience")}
                </h2>

                {isEditing && (
                  <button
                    type="button"
                    onClick={addJob}
                    className="text-[11px] bg-slate-100 hover:bg-blue-600 hover:text-white px-2 py-0.5 rounded font-semibold text-slate-700"
                    style={{ cursor: xpCursors.pointer }}
                  >
                    + {tr("Добавить", "Add")}
                  </button>
                )}
              </div>

              <div className="space-y-4 print:space-y-3">
                {data.experience.map((job, idx) => {
                  const company = job.company[editLocale] || job.company.ru;
                  const role = job.role[editLocale] || job.role.ru;
                  const period = job.period[editLocale] || job.period.ru;

                  return (
                    <div key={idx} className="space-y-1 relative group">
                      <div className="flex justify-between items-baseline gap-2 text-[14px]">
                        <span
                          contentEditable={isEditing}
                          suppressContentEditableWarning
                          onBlur={(e) => updateJob(idx, "company", e.currentTarget.textContent || "")}
                          className="font-bold text-neutral-950 outline-none"
                        >
                          {company}
                        </span>

                        <span
                          contentEditable={isEditing}
                          suppressContentEditableWarning
                          onBlur={(e) => updateJob(idx, "period", e.currentTarget.textContent || "")}
                          className="text-[12px] text-neutral-500 font-normal shrink-0 outline-none"
                        >
                          {period}
                        </span>
                      </div>

                      <div
                        contentEditable={isEditing}
                        suppressContentEditableWarning
                        onBlur={(e) => updateJob(idx, "role", e.currentTarget.textContent || "")}
                        className="text-[13px] font-medium text-neutral-700 outline-none"
                      >
                        {role}
                      </div>

                      <ul className="space-y-1 text-[13px] leading-[1.42] text-neutral-700 list-disc list-outside pl-4 pt-0.5">
                        {job.bullets.map((b, bIdx) => {
                          const bulletText = b[editLocale] || b.ru;
                          return (
                            <li key={bIdx}>
                              <span
                                contentEditable={isEditing}
                                suppressContentEditableWarning
                                onBlur={(e) => updateBullet(idx, bIdx, e.currentTarget.textContent || "")}
                                className="outline-none"
                              >
                                {bulletText}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Section: Skills & Stack */}
            <section className="space-y-3">
              <div className="mb-2.5 print:mb-1.5">
                <h2 className="text-[11px] font-bold uppercase tracking-[0.16em] text-neutral-500 select-none">
                  {tr("Стек и компетенции", "Skills & Stack")}
                </h2>
              </div>

              <div className="space-y-2 text-[12.5px] leading-[1.45] text-neutral-700">
                <div>
                  <strong className="text-neutral-950 font-bold">
                    {tr("Дизайн:", "Design:")}
                  </strong>{" "}
                  <span
                    contentEditable={isEditing}
                    suppressContentEditableWarning
                    onBlur={(e) => updateSkill("specialization", e.currentTarget.textContent || "")}
                    className="outline-none"
                  >
                    {data.skills.specialization[editLocale] || data.skills.specialization.ru}
                  </span>
                </div>

                <div>
                  <strong className="text-neutral-950 font-bold">
                    {tr("Инструменты:", "Tools:")}
                  </strong>{" "}
                  <span
                    contentEditable={isEditing}
                    suppressContentEditableWarning
                    onBlur={(e) => updateSkill("tools", e.currentTarget.textContent || "")}
                    className="outline-none"
                  >
                    {data.skills.tools[editLocale] || data.skills.tools.ru}
                  </span>
                </div>

                <div>
                  <strong className="text-neutral-950 font-bold">
                    {tr("AI:", "AI:")}
                  </strong>{" "}
                  <span
                    contentEditable={isEditing}
                    suppressContentEditableWarning
                    onBlur={(e) => updateSkill("ai", e.currentTarget.textContent || "")}
                    className="outline-none"
                  >
                    {data.skills.ai[editLocale] || data.skills.ai.ru}
                  </span>
                </div>
              </div>
            </section>
          </div>
        </article>
      </div>

      {/* Raw JSON Modal (Only for admin edit mode) */}
      {isJsonOpen && canEdit && (
        <div className="absolute inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-[#ece9d8] border-2 border-[#0055ea] rounded-t-lg shadow-2xl w-full max-w-2xl flex flex-col h-[560px]">
            <div className="xp-titlebar flex items-center justify-between px-3 py-1 bg-gradient-to-r from-[#0055ea] to-[#3a93ff] text-white font-bold text-xs">
              <span>{tr("Редактор текста резюме", "Resume text editor")}</span>
              <button
                type="button"
                onClick={() => setIsJsonOpen(false)}
                className="hover:bg-red-600 px-1.5 rounded"
                style={{ cursor: xpCursors.pointer }}
              >
                ✕
              </button>
            </div>

            <div className="p-3 flex-1 flex flex-col gap-2">
              {jsonError && (
                <div className="bg-red-100 border border-red-300 text-red-700 text-xs p-2 rounded">
                  {jsonError}
                </div>
              )}

              <textarea
                value={jsonDraft}
                onChange={(e) => setJsonDraft(e.target.value)}
                className="flex-1 w-full font-mono text-xs p-3 bg-white border border-slate-400 rounded outline-none resize-none"
                spellCheck={false}
              />
            </div>

            <div className="p-3 bg-[#e4e1d1] border-t border-slate-300 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsJsonOpen(false)}
                className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded border border-slate-400"
                style={{ cursor: xpCursors.pointer }}
              >
                {tr("Отмена", "Cancel")}
              </button>

              <button
                type="button"
                onClick={handleApplyJson}
                className="px-5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded shadow-sm"
                style={{ cursor: xpCursors.pointer }}
              >
                {tr("Применить и сохранить в проект", "Apply and save to project")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* XP Status Bar */}
      <div className="xp-statusbar flex items-center justify-between text-[11px] text-slate-700 px-3 py-1 bg-[#ece9d8] border-t border-[#999]">
        <span>{editLocale === "en" ? "Resume_Vlad_Akhmetov.pdf" : "Резюме_Влад_Ахметов.pdf"}</span>
        <span>1 из 1 стр. • A4 (210 × 297 мм)</span>
        <button
          type="button"
          onClick={handlePrint}
          className="font-semibold text-blue-800 hover:underline"
          style={{ cursor: xpCursors.pointer }}
        >
          {tr("Распечатать / Экспорт в PDF", "Print / Export to PDF")}
        </button>
      </div>
    </div>
  );
}
