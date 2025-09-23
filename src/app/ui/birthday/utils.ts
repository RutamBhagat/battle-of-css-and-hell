import moment from "moment";

export type Person = { name: string; birthday: string };
export type DayMap = Record<string, Person[]>;

export const DayLabels = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export function getYearOptions(): number[] {
  const start = 2000;
  const end = new Date().getFullYear();
  const years: number[] = [];
  for (let y = end; y >= start; y -= 1) years.push(y);
  return years;
}

export function formatBirthday(birthday: string): string {
  const m = moment(birthday, ["YYYY-MM-DD", "MM/DD/YYYY", "DD-MM-YYYY"], true);
  if (!m.isValid()) return birthday;
  return m.format("DD-MM-YYYY");
}

export function parseMonthDay(
  birthday: string,
): { month: number; day: number; birthYear: number } | null {
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

export function computeDayMap(parsed: Person[], year: number): DayMap {
  const labels = [...DayLabels];
  const map: DayMap = Object.fromEntries(labels.map((l) => [l, [] as Person[]]));

  const sorted = [...parsed].sort((a, b) => {
    const pa = parseMonthDay(a.birthday);
    const pb = parseMonthDay(b.birthday);
    if (!pa && !pb) return 0;
    if (!pa) return 1;
    if (!pb) return -1;
    if (pa.birthYear !== pb.birthYear) return pb.birthYear - pa.birthYear;
    if (pa.month !== pb.month) return pb.month - pa.month;
    return pb.day - pa.day;
  });

  for (const p of sorted) {
    const md = parseMonthDay(p.birthday);
    if (!md) continue;
    const dt = new Date(year, md.month - 1, md.day);
    const weekday = dt.getDay();
    const label = labels[weekday];
    map[label].push(p);
  }
  return map;
}

export function initials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

