"use client";

import DayCard from "./DayCard";
import { DayLabels, computeDayMap, type Person } from "./utils";

type Props = {
  people: Person[];
  year: number;
};

export default function DaysSection({ people, year }: Props) {
  const results = computeDayMap(people, year);
  return (
    <>
      {DayLabels.map((day) => (
        <DayCard key={day} day={day} people={results[day] ?? []} />
      ))}
    </>
  );
}

