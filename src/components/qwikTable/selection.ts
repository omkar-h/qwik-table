import type { Signal } from "@builder.io/qwik";
import { getRowKey } from "./helper";
import type { SelectionMode } from "./types";

export const getSelectedIds = (
  selectionMap: Record<string, boolean>,
): string[] =>
  Object.keys(selectionMap).filter((key) => Boolean(selectionMap[key]));

export const toggleSingleRowSelection = (
  rowSelection: Signal<Record<string, boolean>>,
  targetRowId: string,
  mode: SelectionMode,
): string[] => {
  const current = rowSelection.value;
  const wasSelected = Boolean(current[targetRowId]);
  const next: Record<string, boolean> = mode === "single" ? {} : { ...current };

  if (wasSelected) {
    delete next[targetRowId];
  } else {
    next[targetRowId] = true;
  }

  rowSelection.value = next;
  return getSelectedIds(next);
};

export const toggleBatchRowSelection = <T extends object>(
  rowSelection: Signal<Record<string, boolean>>,
  rows: T[],
  rowKeyFields: Extract<keyof T, string | number>[],
): string[] => {
  const current = rowSelection.value;
  if (rows.length === 0) return getSelectedIds(current);

  const keys = new Array<string>(rows.length);
  let allSelected = true;

  for (let i = 0; i < rows.length; i++) {
    const key = getRowKey(rows[i], i, rowKeyFields);
    keys[i] = key;
    if (!current[key]) allSelected = false;
  }

  // O(1) fast path: when deselecting all rows and no other rows are selected, reset directly to `{}`
  if (allSelected && Object.keys(current).length === keys.length) {
    rowSelection.value = {};
    return [];
  }

  const next: Record<string, boolean> = { ...current };
  for (let i = 0; i < keys.length; i++) {
    if (allSelected) {
      delete next[keys[i]];
    } else {
      next[keys[i]] = true;
    }
  }

  // 1 atomic Signal assignment instead of N Proxy traps
  rowSelection.value = next;
  return getSelectedIds(next);
};

export const computeSelectionFlags = <T extends object>(
  selectionMap: Record<string, boolean> | undefined,
  pageRows: T[],
  allRows: T[],
  rowKeyFields: Extract<keyof T, string | number>[],
) => {
  if (!selectionMap) {
    return {
      isAllPageSelected: false,
      isSomePageSelected: false,
      isAllRowsSelected: false,
    };
  }

  let selectedOnPage = 0;
  for (let i = 0; i < pageRows.length; i++) {
    if (selectionMap[getRowKey(pageRows[i], i, rowKeyFields)]) {
      selectedOnPage++;
    }
  }

  const isAllPageSelected =
    pageRows.length > 0 && selectedOnPage === pageRows.length;
  const isSomePageSelected =
    selectedOnPage > 0 && selectedOnPage < pageRows.length;
  const isAllRowsSelected =
    allRows.length > 0 &&
    allRows.every((row, idx) =>
      Boolean(selectionMap[getRowKey(row, idx, rowKeyFields)]),
    );

  return { isAllPageSelected, isSomePageSelected, isAllRowsSelected };
};
