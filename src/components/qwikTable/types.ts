import type { QRL, JSXOutput } from "@builder.io/qwik";

/** Allowed sorting directions for a column. */
export type SortDirection = "asc" | "desc" | null;

/**
 * Represents the current sorting state of the table.
 */
export interface SortState {
  /** The ID of the column currently being sorted, or `null` if unsorted. */
  columnId: string | null;
  /** The active sort direction (`'asc'` or `'desc'`), or `null` if unsorted. */
  direction: SortDirection;
}

/**
 * Optional CSS class names applied to individual HTML elements of the table.
 */
export interface TableClassNames {
  /** Class applied to the outer wrapper `<div>`. */
  container?: string;
  /** Class applied to the `<table>` element. */
  table?: string;
  /** Class applied to the `<thead>` element. */
  thead?: string;
  /** Class applied to the header `<tr>` element. */
  headerRow?: string;
  /** Default class applied to every `<th>` header cell. */
  th?: string;
  /** Class applied to the `<tbody>` element. */
  tbody?: string;
  /** Class applied to every body `<tr>` row. */
  tr?: string;
  /** Default class applied to every `<td>` data cell. */
  td?: string;
}

/**
 * Configuration object defining a single column in `QwikTable`.
 *
 * @template T - The data interface representing a single row object.
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
   * Enables click-to-sort cycling (`asc` → `desc` → `null`) on this column header.
   * @default false
   */
  sortable?: boolean;

  /**
   * Optional CSS class applied specifically to this column's `<th>` header cell.
   * Appended after `classNames.th`.
   */
  headerClass?: string;

  /**
   * Optional CSS class applied specifically to this column's `<td>` data cells.
   * Appended after `classNames.td`.
   */
  cellClass?: string;

  /**
   * Optional QRL function for rendering custom JSX inside this column's `<th>` header.
   * Receives the column config and its current {@link SortDirection}.
   */
  headerRender$?: QRL<
    (column: ColumnConfig<T>, sortDirection: SortDirection) => JSXOutput
  >;

  /**
   * Optional QRL function for rendering custom JSX inside this column's `<td>` cells.
   * Must be wrapped in `$()` to preserve Qwik's serialization boundary.
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

  /** Optional slot-based CSS classes for styling table elements. */
  classNames?: TableClassNames;
}
