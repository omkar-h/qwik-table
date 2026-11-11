import type { QRL, JSXOutput } from "@builder.io/qwik";

/**
 * Represents the current sorting state of the table.
 */
export interface SortState {
  /** The ID of the column currently being sorted, or `null` if unsorted. */
  columnId: string | null;
  /** The active sort direction (`'asc'` or `'desc'`), or `null` if unsorted. */
  direction: "asc" | "desc" | null;
}

/**
 * Configuration object defining a single column in `QwikTable`.
 *
 * @template T - The data interface representing a single row object.
 * @example
 * const columns: ColumnConfig<User>[] = [
 *   { id: "firstName", label: "First Name", sortable: true },
 *   {
 *     id: "age",
 *     label: "Age",
 *     render$: $((val) => <strong>{String(val)} yrs</strong>),
 *   },
 * ];
 */
export interface ColumnConfig<T extends object = Record<string, unknown>> {
  /**
   * Key matching a property on the row data object, or a unique string identifier
   * for virtual columns (such as an `"actions"` column).
   */
  id: Extract<keyof T, string | number> | string;

  /** Display text rendered inside the column's `<th>` header cell. */
  label: string;

  /**
   * Enables click-to-sort cycling (`asc` → `desc` → `none`) on this column header.
   * @default false
   */
  sortable?: boolean;

  /**
   * Optional QRL function for rendering custom JSX inside this column's cells.
   * Must be wrapped in `$()` to preserve Qwik's serialization boundary.
   *
   * @param value - The raw property value at `row[col.id]`.
   * @param row - The full data object for the current row.
   */
  render$?: QRL<(value: unknown, row: T) => JSXOutput>;
}

/**
 * Props accepted by the `<QwikTable />` component.
 *
 * @template T - The data interface representing a single row object.
 */
export interface QwikTableProps<T extends object = Record<string, unknown>> {
  /** Array of plain data objects to render as table rows. */
  rowData: T[];

  /** Array of column definitions controlling headers, sorting, and cell rendering. */
  columnConfig: ColumnConfig<T>[];

  /**
   * Optional QRL callback invoked whenever a sortable column header is clicked.
   * Receives the updated {@link SortState}.
   */
  onSort$?: QRL<(sortState: SortState) => void>;

  /**
   * When `true`, disables internal client-side array sorting.
   * Use this alongside `onSort$` when sorting is handled on a backend server.
   * @default false
   */
  manualSort?: boolean;
}
