"use client";

import { useEffect, useMemo, useState } from "react";
import DaysSection from "./birthday/DaysSection";
import JsonInput from "./birthday/JsonInput";
import { getYearOptions, type Person } from "./birthday/utils";
import YearSelector from "./birthday/YearSelector";

type Props = { initialText?: string };

export default function BirthdayInput({ initialText }: Props) {
  const years = useMemo(() => getYearOptions(), []);
  const defaultYear = years[0];
  const [year, setYear] = useState<number>(defaultYear);
  const minYear = years[years.length - 1];
  const maxYear = years[0];

  const [people, setPeople] = useState<Person[]>([]);

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
        <DaysSection people={people} year={year} />
      </section>

      <JsonInput onPeopleChange={setPeople} initialText={initialText} />
    </main>
  );
}
