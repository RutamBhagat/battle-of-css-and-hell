"use client";

import { useEffect, useMemo, useState } from "react";

import JsonEditor from "./JsonEditor";
import type { Person } from "./utils";
import moment from "moment";
import { z } from "zod";

type Props = {
  onPeopleChange: (people: Person[]) => void;
  initialText?: string;
};

export default function JsonInput({ onPeopleChange, initialText }: Props) {
  const [text, setText] = useState<string>(initialText ?? "[]");
  const [_error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialText != null) return;
    (async () => {
      try {
        const res = await fetch("/birthday.json", { cache: "no-store" });
        if (!res.ok) return;
        const body = await res.text();
        setText(body);
      } catch {
      }
    })();
  }, [initialText]);

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
                [
                  "YYYY-MM-DD",
                  "MM/DD/YYYY",
                  "M/D/YYYY",
                  "DD-MM-YYYY",
                  "D-M-YYYY",
                ],
                true,
              ).isValid(),
            "Invalid birthday format",
          ),
      }),
    [],
  );

  const PeopleSchema = useMemo(() => z.array(PersonSchema), [PersonSchema]);

  useEffect(() => {
    try {
      setError(null);
      const raw = JSON.parse(text);
      const result = PeopleSchema.safeParse(raw);
      if (!result.success) {
        setError("Invalid JSON");
        onPeopleChange([]);
        return;
      }
      onPeopleChange(result.data);
    } catch {
      setError("Invalid JSON");
      onPeopleChange([]);
    }
  }, [text, PeopleSchema, onPeopleChange]);

  return <JsonEditor text={text} setText={setText} />;
}
