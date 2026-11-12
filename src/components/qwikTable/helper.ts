export const cx = (...classes: (string | undefined)[]): string | undefined => {
  const joined = classes.filter(Boolean).join(" ");
  return joined || undefined;
};

export const getRowKey = <T extends object>(
  row: T,
  rowIndex: number,
  keys?: Extract<keyof T, string | number>[],
): string | number => {
  if (!keys || keys.length === 0) return rowIndex;
  return keys
    .map((key) => String((row as Record<string, unknown>)[String(key)]))
    .join("-");
};
