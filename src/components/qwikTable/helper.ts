import { SortDirection } from "./types";

export const cx = (...classes: (string | undefined)[]): string | undefined => {
  const joined = classes.filter(Boolean).join(" ");
  return joined || undefined;
};

export const getRowKey = <T extends object>(
  row: T,
  rowIndex: number,
  keys?: Extract<keyof T, string | number>[],
): string => {
  if (!keys || keys.length === 0) return String(rowIndex);
  return keys
    .map((key) => String((row as Record<string, unknown>)[String(key)]))
    .join("-");
};

export const getValueByPath = (obj: unknown, path: string): unknown => {
  if (obj == null || typeof obj !== "object") return undefined;

  const record = obj as Record<string, unknown>;
  if (Object.prototype.hasOwnProperty.call(record, path)) {
    return record[path];
  }

  if (!path.includes(".")) {
    return record[path];
  }

  const segments = path.split(".");
  let current: unknown = obj;

  for (let i = 0; i < segments.length; i++) {
    if (current == null || typeof current !== "object") {
      return undefined;
    }
    current = (current as Record<string, unknown>)[segments[i]];
  }

  return current;
};

export const toAriaSort = (
  sortable: boolean | undefined,
  direction: SortDirection,
): "ascending" | "descending" | "none" | undefined => {
  if (!sortable) return undefined;
  if (direction === "asc") return "ascending";
  if (direction === "desc") return "descending";
  return "none";
};