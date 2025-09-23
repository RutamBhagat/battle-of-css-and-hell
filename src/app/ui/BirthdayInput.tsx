"use client";

import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Frown,
} from "lucide-react";

import Editor from "@monaco-editor/react";
import React from "react";
import { useDropzone } from "react-dropzone";

type Props = {
  initialText?: string;
};

function getYearOptions(): number[] {
  const start = 2000;
  const end = new Date().getFullYear();
  const years: number[] = [];
  for (let y = end; y >= start; y -= 1) years.push(y);
  return years;
}

export default function BirthdayInput({ initialText }: Props) {
  const years = React.useMemo(() => getYearOptions(), []);
  const defaultYear = years[0];
  const [year, setYear] = React.useState<number>(defaultYear);
  const minYear = years[years.length - 1];
  const maxYear = years[0];
  const clampYear = React.useCallback(
    (y: number) => Math.min(maxYear, Math.max(minYear, y)),
    [minYear, maxYear],
  );
  const [text, setText] = React.useState<string>(initialText ?? "[]");
  const [error, setError] = React.useState<string | null>(null);

  // Drag & drop: accept a single .json file and load its contents
  const onDrop = React.useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onerror = () => setError("Failed to read file");
    reader.onload = () => {
      const textContent = String(reader.result ?? "");
      setText(textContent);
    };
    reader.readAsText(file);
  }, []);
  // Make the whole editor area a drop target (drag-only, no click)
  const {
    getRootProps: getEditorRootProps,
    getInputProps: getEditorInputProps,
    isDragActive: isEditorDragActive,
  } = useDropzone({
    accept: { "application/json": [".json"] },
    maxFiles: 1,
    onDrop,
    noClick: true,
    noKeyboard: true,
  });

  React.useEffect(() => {
    if (initialText == null) {
      (async () => {
        try {
          const res = await fetch("/birthday.json", { cache: "no-store" });
          if (!res.ok) throw new Error(String(res.status));
          const body = await res.text();
          setText(body);
        } catch (err) {
          console.error("Failed to load /birthday.json", err);
        }
      })();
    }
  }, [initialText]);

  type Person = { name: string; birthday: string };
  type DayMap = Record<string, Person[]>;

  const parsed: Person[] = React.useMemo(() => {
    try {
      setError(null);
      const raw = JSON.parse(text);
      if (!Array.isArray(raw)) return [];
      return raw
        .filter(
          (it: any) =>
            it && typeof it.name === "string" && typeof it.birthday === "string"
        )
        .map((it: any) => ({ name: it.name, birthday: it.birthday }));
    } catch (e: any) {
      setError("Invalid JSON");
      return [];
    }
  }, [text]);

  function parseMonthDay(
    birthday: string
  ): { month: number; day: number; birthYear: number } | null {
    // Supports "YYYY-MM-DD" and "MM/DD/YYYY"
    if (/^\d{4}-\d{2}-\d{2}$/.test(birthday)) {
      const [y, m, d] = birthday.split("-").map((s) => Number(s));
      return { month: m, day: d, birthYear: y };
    }
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(birthday)) {
      const [m, d, y] = birthday.split("/").map((s) => Number(s));
      return { month: m, day: d, birthYear: y };
    }
    return null;
  }

  function computeDayMap(): DayMap {
    const labels = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const map: DayMap = Object.fromEntries(labels.map((l) => [l, [] as Person[]]));

    // Sort youngest to oldest (later birth year first)
    const sorted = [...parsed].sort((a, b) => {
      const pa = parseMonthDay(a.birthday);
      const pb = parseMonthDay(b.birthday);
      if (!pa && !pb) return 0;
      if (!pa) return 1;
      if (!pb) return -1;
      if (pa.birthYear !== pb.birthYear) return pb.birthYear - pa.birthYear; // younger first
      // Tie-breaker by month/day later is younger
      if (pa.month !== pb.month) return pb.month - pa.month;
      return pb.day - pa.day;
    });

    for (const p of sorted) {
      const md = parseMonthDay(p.birthday);
      if (!md) continue;
      // JS Date months are 0-based
      const dt = new Date(year, md.month - 1, md.day);
      const weekday = dt.getDay(); // 0=Sun..6=Sat
      const label = labels[weekday];
      map[label].push(p);
    }
    return map;
  }

  const results = React.useMemo(() => computeDayMap(), [parsed, year]);

  function initials(fullName: string): string {
    const parts = fullName.trim().split(/\s+/);
    const first = parts[0]?.[0] ?? "";
    const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
    return (first + last).toUpperCase();
  }

  function nameColorIndex(name: string): number {
    // Deterministic hash to spread across 5 colors (stable across renders)
    let h = 0;
    for (let i = 0; i < name.length; i++) {
      h = (h * 31 + name.charCodeAt(i)) >>> 0;
    }
    return h % 5; // 0..4
  }

  // Global arrow key hotkeys for year (unless typing in inputs/editors)
  React.useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const tag = (target?.tagName || "").toLowerCase();
      const typing =
        tag === "input" ||
        tag === "textarea" ||
        (target?.isContentEditable ?? false) ||
        !!target?.closest?.(".monaco-editor");
      if (typing) return;
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setYear((y) => clampYear(y + 1));
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setYear((y) => clampYear(y - 1));
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [clampYear]);

  return (
    <main className="container">

      <section className="calendar">
        <div className="day-card">
          <div className="day-header day-header-right">YEAR</div>
          <div className="day-body year-body">
            <button
              type="button"
              className="year-segment year-segment-button"
              onClick={() => setYear((y) => clampYear(y + 1))}
              disabled={year >= maxYear}
              aria-label="Increase year"
              title="Increase year"
            >
              <ChevronUp size={24} aria-hidden />
            </button>
            <div className="year-segment year-segment-select-wrap">
              <select
                id="year-select"
                className="year-segment-select"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                onKeyDown={(e) => {
                  if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setYear((y) => clampYear(y + 1));
                  } else if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setYear((y) => clampYear(y - 1));
                  }
                }}
                aria-label="Year"
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              className="year-segment year-segment-button"
              onClick={() => setYear((y) => clampYear(y - 1))}
              disabled={year <= minYear}
              aria-label="Decrease year"
              title="Decrease year"
            >
              <ChevronDown size={24} aria-hidden />
            </button>
          </div>
        </div>
        {(
          [
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
          ] as const
        ).map((day) => {
          const people = results[day] ?? [];
          const count = people.length;
          const cols = Math.max(1, Math.ceil(Math.sqrt(Math.max(1, count))));
          const total = cols * cols;
          // Assign colors: prefer stable hash per name, but keep colors unique within the day.
          return (
            <div key={day} className="day-card">
              <div className="day-header day-header-right">
                {day.slice(0, 3).toUpperCase()}
              </div>
              {count === 0 ? (
                <div
                  className="day-body day-empty-state"
                  aria-label={`${day} empty`}
                >
                  <Frown size={64} aria-hidden />
                </div>
              ) : (
                <div className="day-body">
                  <div
                    className="day-grid"
                    style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
                  >
                    {Array.from({ length: total }).map((_, i) => {
                      if (i < count) {
                        const person = people[i];
                        const name = person.name;
                        const idx = i % 5; // position-based color: 0..4 cycling left-to-right
                        return (
                          <div
                            key={i}
                            className={`cell color-${idx}`}
                            title={`${name} — ${person.birthday}`}
                            data-name={name}
                            data-date={person.birthday}
                            aria-label={name}
                          >
                            {initials(name)}
                          </div>
                        );
                      }
                      return (
                        <div
                          key={i}
                          className="cell empty"
                          aria-hidden="true"
                        />
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </section>

      <section className="field">
        <div className="textarea-frame">
          <div className="editor-wrap" {...getEditorRootProps()}>
            <input {...getEditorInputProps()} />
            <Editor
              height="40vh"
              defaultLanguage="json"
              language="json"
              value={text}
              onChange={(val) => setText(val ?? "")}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: "on",
                scrollBeyondLastLine: false,
                wordWrap: "on",
              }}
            />
            <div className={`drop-overlay${isEditorDragActive ? " active" : ""}`}>
              Drop JSON to load
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
