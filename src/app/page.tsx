"use client";

import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import moment from "moment";
import YearSelector from "./ui/birthday/YearSelector";
import DayCard from "./ui/birthday/DayCard";
import EditorSection from "./ui/birthday/EditorSection";
import {
  DayLabels,
  computeDayMap,
  getYearOptions,
  type Person,
} from "./ui/birthday/utils";

export default function Home() {
  const years = useMemo(() => getYearOptions(), []);
  const defaultYear = years[0];
  const [year, setYear] = useState<number>(defaultYear);
  const minYear = years[years.length - 1];
  const maxYear = years[0];

  const [text, setText] = useState<string>("[]");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/birthday.json", { cache: "no-store" });
        if (!res.ok) return; // optional
        const body = await res.text();
        setText(body);
      } catch {
        // noop: optional data
      }
    })();
  }, []);

  const PersonSchema = useMemo(
    () =>
      z.object({
        name: z.string().min(1),
        birthday: z
          .string()
          .refine(
            (s) =>
              moment(
                s,
                ["YYYY-MM-DD", "MM/DD/YYYY", "M/D/YYYY", "DD-MM-YYYY", "D-M-YYYY"],
                true,
              ).isValid(),
            "Invalid birthday format",
          ),
      }),
    [],
  );

  const PeopleSchema = useMemo(() => z.array(PersonSchema), [PersonSchema]);

  const parsed: Person[] = useMemo(() => {
    try {
      setError(null);
      const raw = JSON.parse(text);
      const result = PeopleSchema.safeParse(raw);
      if (!result.success) {
        setError("Invalid JSON");
        return [];
      }
      return result.data;
    } catch {
      setError("Invalid JSON");
      return [];
    }
  }, [text, PeopleSchema]);

  const results = useMemo(() => computeDayMap(parsed, year), [parsed, year]);

  // Global arrow key hotkeys for year (unless typing in inputs/editors)
  useEffect(() => {
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
        setYear((y) => Math.min(maxYear, Math.max(minYear, y + 1)));
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setYear((y) => Math.min(maxYear, Math.max(minYear, y - 1)));
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [minYear, maxYear]);

  return (
    <main className="container">
      <section className="calendar">
        <YearSelector
          year={year}
          minYear={minYear}
          maxYear={maxYear}
          years={years}
          onChangeYear={setYear}
        />
        {DayLabels.map((day) => (
          <DayCard key={day} day={day} people={results[day] ?? []} />
        ))}
      </section>

      <EditorSection text={text} setText={setText} />

      {error ? (
        <div role="alert" style={{ color: "#b00020", marginTop: 8 }}>
          {error}
        </div>
      ) : null}
    </main>
  );
}
