"use client";

import { ChevronDown, ChevronUp } from "lucide-react";

type Props = {
  year: number;
  minYear: number;
  maxYear: number;
  years: number[];
  onChangeYear: (year: number) => void;
};

export default function YearSelector({
  year,
  minYear,
  maxYear,
  years,
  onChangeYear,
}: Props) {
  const clampYear = (y: number) => Math.min(maxYear, Math.max(minYear, y));
  return (
    <div className="day-card">
      <div className="day-header day-header-right">YEAR</div>
      <div className="day-body year-body">
        <button
          type="button"
          className="year-segment year-segment-button"
          onClick={() => onChangeYear(clampYear(year + 1))}
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
            onChange={(e) => onChangeYear(Number(e.target.value))}
            onKeyDown={(e) => {
              if (e.key === "ArrowUp") {
                e.preventDefault();
                onChangeYear(clampYear(year + 1));
              } else if (e.key === "ArrowDown") {
                e.preventDefault();
                onChangeYear(clampYear(year - 1));
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
          onClick={() => onChangeYear(clampYear(year - 1))}
          disabled={year <= minYear}
          aria-label="Decrease year"
          title="Decrease year"
        >
          <ChevronDown size={24} aria-hidden />
        </button>
      </div>
    </div>
  );
}

