"use client";

import { Frown } from "lucide-react";
import {
  computeDayMap,
  DayLabels,
  formatBirthday,
  initials,
  type Person,
} from "./utils";

type Props = {
  people: Person[];
  year: number;
};

export default function DaysSection({ people, year }: Props) {
  const results = computeDayMap(people, year);
  return (
    <>
      {DayLabels.map((day) => {
        const dayPeople = results[day] ?? [];
        const count = dayPeople.length;
        const cols = Math.max(1, Math.ceil(Math.sqrt(Math.max(1, count))));
        const total = cols * cols;
        const placeholderKeys = Array.from(
          { length: total - count },
          (_, i) => `empty-${day}-${i}`,
        );
        return (
          <div key={day} className="day-card">
            <div className="day-header day-header-right">
              {day.slice(0, 3).toUpperCase()}
            </div>
            {count === 0 ? (
              <div
                className="day-body day-empty-state"
                role="img"
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
                  {dayPeople.map((person, idx) => {
                    const name = person.name;
                    const colorIdx = idx % 5;
                    return (
                      <div
                        key={`${name}-${person.birthday}`}
                        className={`cell color-${colorIdx}`}
                        title={`${name} — ${formatBirthday(person.birthday)}`}
                        data-name={name}
                        data-date={formatBirthday(person.birthday)}
                        role="img"
                        aria-label={name}
                      >
                        {initials(name)}
                      </div>
                    );
                  })}
                  {placeholderKeys.map((k) => (
                    <div key={k} className="cell empty" aria-hidden="true" />
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}
