import type { QRL, Component, Signal } from "@builder.io/qwik";

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
  /** Class applied to the empty-state `<tr>` row when no records match. */
  emptyRow?: string;
  /** Class applied to the empty-state `<td colSpan={...}>` cell. */
  emptyCell?: string;
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
   * Optional Qwik `component$` rendered inside this column's `<th>` header.
   */
  headerComponent?: Component<{
    column: ColumnConfig<T>;
    sortDirection: SortDirection;
  }>;

  /**
   * Optional Qwik `component$` rendered inside this column's `<td>` cells.
   */
  cellComponent?: Component<{
    value: unknown;
    row: T;
  }>;
}

/**
 * Props accepted by the `<QwikTable />` component.
 *
 * @template T - The data interface representing a single row object.
 */
export interface QwikTableProps<T extends object = Record<string, unknown>> {
  /** Array of plain data objects (or a reactive `Signal<T[]>`) to render as table rows. */
  rowData: T[] | Signal<T[]>;

  /** Array of column definitions controlling headers, sorting, and cell rendering. */
  columnConfig: ColumnConfig<T>[];

  /**
   * Required property keys on each row object used to build a unique composite DOM key for `<tr>`.
   * Preserves stateful components inside cells when rows are sorted or filtered.
   */
  rowKey: Extract<keyof T, string | number>[];

  /**
   * Optional search string (or a reactive `Signal<string>`) used to filter rows case-insensitively.
   */
  searchQuery?: string | Signal<string>;

  /**
   * Optional Qwik `component$` rendered when `rowData` is empty
   * or when `searchQuery` yields zero matching rows.
   */
  emptyComponent?: Component<object>;

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
