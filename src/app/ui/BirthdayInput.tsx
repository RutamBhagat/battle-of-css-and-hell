"use client";

import React from "react";

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

export default function BirthdayInput({ initialText = "[]" }: Props) {
  const years = React.useMemo(() => getYearOptions(), []);
  const defaultYear = years[0];
  const [year, setYear] = React.useState<number>(defaultYear);
  const [text, setText] = React.useState<string>(initialText);
  const [error, setError] = React.useState<string | null>(null);

  type Person = { name: string; birthday: string };
  type DayMap = Record<string, string[]>;

  const parsed: Person[] = React.useMemo(() => {
    try {
      setError(null);
      const raw = JSON.parse(text);
      if (!Array.isArray(raw)) return [];
      return raw
        .filter((it: any) => it && typeof it.name === "string" && typeof it.birthday === "string")
        .map((it: any) => ({ name: it.name, birthday: it.birthday }));
    } catch (e: any) {
      setError("Invalid JSON");
      return [];
    }
  }, [text]);

  function parseMonthDay(birthday: string): { month: number; day: number; birthYear: number } | null {
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
    const labels = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const map: DayMap = Object.fromEntries(labels.map((l) => [l, []]));

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
      map[label].push(p.name);
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

  return (
    <main className="container">
      <section className="field">
        <label htmlFor="year-select" className="label">Year</label>
        <select
          id="year-select"
          className="control select"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
        >
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </section>

      <section className="field">
        <label htmlFor="json-input" className="label">Birthdays (JSON)</label>
        <div className="textarea-frame">
          <textarea
            id="json-input"
            className="control textarea"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={16}
          />
        </div>
        {error ? <div className="error">Parse Error: {error}</div> : null}
      </section>

      <section className="results">
        <div className="results-title">Results</div>
        {(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const).map(
          (day) => (
            <div key={day} className="result-line">
              <span className="day-label">{day}</span>
              <span className="day-values">{results[day].join(", ")}</span>
            </div>
          ),
        )}
      </section>

      <section className="calendar">
        {(["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const).map(
          (day) => {
            const people = results[day] ?? [];
            const count = people.length;
            const cols = Math.max(1, Math.ceil(Math.sqrt(Math.max(1, count))));
            const total = cols * cols;
            return (
              <div key={day} className="day-card">
                <div className="day-header day-header-right">{day.slice(0, 3).toUpperCase()}</div>
                <div className="day-body">
                  <div className="day-grid" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
                    {Array.from({ length: total }).map((_, i) => {
                      if (i < count) {
                        const name = people[i];
                        const idx = nameColorIndex(name);
                        return (
                          <div
                            key={i}
                            className={`cell color-${idx}`}
                            title={name}
                            aria-label={name}
                          >
                            {initials(name)}
                          </div>
                        );
                      }
                      return <div key={i} className="cell empty" aria-hidden="true" />;
                    })}
                  </div>
                </div>
              </div>
            );
          },
        )}
      </section>
    </main>
  );
}
