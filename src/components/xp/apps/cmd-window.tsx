"use client";

import React, { useState, useRef, useEffect } from "react";
import { projects } from "@/data/projects";
import { site } from "@/data/site";
import { useWindowManager } from "../window-manager-context";

interface CommandLog {
  text: string;
  isCmd?: boolean;
}

export function CmdWindow() {
  const { openProject } = useWindowManager();
  const [input, setInput] = useState("");
  const [logs, setLogs] = useState<CommandLog[]>([
    { text: "Microsoft Windows XP [Version 5.1.2600]" },
    { text: "(C) Copyright 1985-2001 Microsoft Corp." },
    { text: "" },
    { text: "Type 'help' to see available commands." },
    { text: "" },
  ]);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim().toLowerCase();
    if (!trimmed) return;

    const newLogs = [...logs, { text: `C:\\Documents and Settings\\Vlad>${input}`, isCmd: true }];

    const parts = trimmed.split(" ");
    const cmd = parts[0];
    const arg = parts[1];

    switch (cmd) {
      case "help":
        newLogs.push(
          { text: "Available commands:" },
          { text: "  dir           - List all portfolio projects" },
          { text: "  open <name>   - Open project window (e.g. 'open kora')" },
          { text: "  whoami        - Display bio and role" },
          { text: "  contact       - Show contacts and links" },
          { text: "  clear / cls   - Clear the console" },
          { text: "  matrix        - Enter the matrix" },
        );
        break;

      case "dir":
      case "projects":
      case "ls":
        newLogs.push(
          { text: " Directory of C:\\Projects" },
          { text: "" },
          ...projects.map((p) => ({
            text: `  ${p.year}   <DIR>          ${p.slug.toUpperCase()}       (${p.title})`,
          })),
          { text: `               ${projects.length} File(s)` },
        );
        break;

      case "open":
        if (arg) {
          const found = projects.find((p) => p.slug === arg);
          if (found) {
            newLogs.push({ text: `Launching project window for '${arg}'...` });
            openProject(arg);
          } else {
            newLogs.push({ text: `Error: Project '${arg}' not found. Type 'dir' to list projects.` });
          }
        } else {
          newLogs.push({ text: "Usage: open <project_name> (e.g. 'open kora')" });
        }
        break;

      case "whoami":
        newLogs.push(
          { text: `${site.name} — ${site.role.ru}` },
          { text: site.now.ru },
        );
        break;

      case "contact":
        newLogs.push(
          { text: `Telegram: ${site.telegram}` },
          { text: `Email:    ${site.email}` },
          { text: `Handle:   ${site.handle}` },
        );
        break;

      case "cls":
      case "clear":
        setLogs([]);
        setInput("");
        return;

      case "matrix":
        newLogs.push(
          { text: "Wake up, Neo..." },
          { text: "The Matrix has you." },
          { text: "Follow the white rabbit." },
        );
        break;

      default:
        newLogs.push({
          text: `'${cmd}' is not recognized as an internal or external command. Type 'help'.`,
        });
        break;
    }

    setLogs(newLogs);
    setInput("");
  };

  return (
    <div
      className="flex-1 bg-black text-[#22c55e] p-3 font-mono text-xs overflow-y-auto select-text flex flex-col"
      onClick={() => {
        const el = document.getElementById("cmd-prompt-input");
        el?.focus();
      }}
    >
      <div className="space-y-1">
        {logs.map((log, i) => (
          <div key={i} className={log.isCmd ? "text-white font-bold" : "text-[#22c55e]"}>
            {log.text}
          </div>
        ))}
      </div>

      {/* Interactive prompt line */}
      <form onSubmit={handleSubmit} className="flex items-center gap-1 mt-1 text-white">
        <span className="text-[#22c55e] whitespace-nowrap">
          C:\Documents and Settings\Vlad&gt;
        </span>
        <input
          id="cmd-prompt-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 bg-transparent border-0 outline-none text-white font-mono text-xs p-0 m-0"
          autoFocus
          spellCheck={false}
        />
      </form>
      <div ref={bottomRef} />
    </div>
  );
}
