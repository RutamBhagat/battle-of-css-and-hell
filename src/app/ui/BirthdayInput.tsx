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

  return (
    <main>
      <section>
        <label htmlFor="year-select">Year</label>
        <select
          id="year-select"
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

      <section>
        <label htmlFor="json-input">Birthdays (JSON)</label>
        <textarea
          id="json-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={16}
          cols={80}
        />
      </section>

      <section>
        <div>Debug</div>
        <div>
          Selected Year: <strong>{year}</strong>
        </div>
        <div>
          JSON Length: <strong>{text.length}</strong>
        </div>
      </section>
    </main>
  );
}

