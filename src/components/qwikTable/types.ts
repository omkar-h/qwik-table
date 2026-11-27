import type { QRL, Component, Signal } from "@builder.io/qwik";

/** Allowed sorting directions for a column. */
export type SortDirection = "asc" | "desc" | null;

/** Non-null sort direction passed to custom sort comparators. */
export type ActiveSortDirection = Exclude<SortDirection, null>;

/** Allowed row selection modes. */
export type SelectionMode = "multiple" | "single";

/** Map of column IDs to visibility state (`false` hides the column). */
export type ColumnVisibilityMap = Record<string, boolean>;

/** Custom comparator function for sorting rows by a column. */
export type SortComparator<T> = (
  rowA: T,
  rowB: T,
  direction: ActiveSortDirection,
) => number;

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
 * Represents the computed pagination metadata passed to `paginationComponent`.
 */
export interface PaginationState {
  /** Current 1-indexed active page number. */
  currentPage: number;
  /** Number of rows displayed per page. */
  pageSize: number;
  /** Total number of matching rows (or server-reported total when `manualPagination` is `true`). */
  totalRows: number;
  /** Total number of available pages (`>= 1`). */
  totalPages: number;
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
  /** Optional class appended to a body `<tr>` row when selected via `rowSelection`. */
  selectedTr?: string;
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
 * @template TMeta - Optional custom metadata or action handlers forwarded to cell/header components.
 */
export interface ColumnConfig<
  T extends object = Record<string, unknown>,
  TMeta = Record<string, unknown>,
> {
  /**
   * Key matching a property or nested dot-path on the row data object (such as `"address.city"`),
   * or a unique string identifier for virtual/computed columns (such as `"actions"` or `"select"`).
   */
  id: Extract<keyof T, string | number> | (string & {});

  /** Display text rendered inside the column's `<th>` header cell. */
  label: string;

  /**
   * Hides the column by default when `true`.
   * Overridden per column ID when `columnVisibility` specifies a boolean value.
   * @default false
   */
  hidden?: boolean;

  /**
   * Optional value extractor used for searching, default sorting, and default cell rendering.
   * Evaluated inside `pipeline.ts` rather than pre-read on `cellComponent` columns.
   */
  accessorFn?: (row: T) => unknown;

  /**
   * Enables click-to-sort cycling (`asc` → `desc` → `null`) on this column header.
   * @default false
   */
  sortable?: boolean;

  /**
   * Optional custom comparator used when sorting by this column.
   * Falls back to standard value comparison when omitted.
   */
  sortFn?: SortComparator<T>;

  /**
   * Whether `searchQuery` checks this column's values when filtering rows.
   * Defaults to `true` for plain text columns and `false` for columns with a custom `cellComponent`.
   */
  searchable?: boolean;

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
    column: ColumnConfig<T, TMeta>;
    sortDirection: SortDirection;
    isAllPageSelected: boolean;
    isSomePageSelected: boolean;
    toggleVisibleRows$: QRL<() => void>;
    isAllRowsSelected: boolean;
    toggleAllRows$: QRL<() => void>;
    meta?: TMeta;
  }>;

  /**
   * Optional Qwik `component$` rendered inside this column's `<td>` cells.
   */
  cellComponent?: Component<{
    row: T;
    column: ColumnConfig<T, TMeta>;
    rowId: string;
    isSelected: boolean;
    toggleRow$: QRL<(rowId: string) => void>;
    meta?: TMeta;
  }>;
}

/**
 * Props accepted by the `<QwikTable />` component.
 *
 * @template T - The data interface representing a single row object.
 * @template TMeta - Optional custom metadata or action handlers forwarded to cell/header components.
 */
export interface QwikTableProps<
  T extends object = Record<string, unknown>,
  TMeta = Record<string, unknown>,
> {
  /** Array of plain data objects (or a reactive `Signal<T[]>`) to render as table rows. */
  rowData: T[] | Signal<T[]>;

  /** Array of column definitions controlling headers, sorting, and cell rendering. */
  columnConfig: ColumnConfig<T, TMeta>[];

  /**
   * Top-level property keys on each row object used to build a unique composite DOM key for `<tr>`.
   * Preserves stateful components inside cells when rows are sorted or filtered.
   */
  rowKey: Extract<keyof T, string | number>[];

  /**
   * Optional reactive visibility map keyed by column `id`.
   * Setting a column ID to `false` hides it; overrides `ColumnConfig.hidden`.
   */
  columnVisibility?: Signal<ColumnVisibilityMap>;

  /**
   * Optional search string (or a reactive `Signal<string>`) used to filter rows case-insensitively.
   */
  searchQuery?: string | Signal<string>;

  /**
   * Optional custom metadata or QRL action handlers (such as `onDelete$`) forwarded
   * directly to every `cellComponent`, `headerComponent`, and `paginationComponent`.
   */
  meta?: TMeta;

  /**
   * Optional reactive `Signal<Record<string, boolean>>` keyed by each row's
   * composite `rowKey` string (`rowId`). Enables O(1) atomic batch selection.
   */
  rowSelection?: Signal<Record<string, boolean>>;

  /**
   * Controls whether multiple rows or at most one row can be selected at a time.
   * @default "multiple"
   */
  selectionMode?: SelectionMode;

  /**
   * Optional QRL callback invoked whenever row selection changes.
   * Receives an array of currently selected composite `rowId` keys.
   */
  onRowSelectionChange$?: QRL<(selectedRowIds: string[]) => void>;

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

  /**
   * Optional reactive `Signal<number>` controlling how many rows render per page.
   * When omitted or `<= 0`, pagination is disabled and all matching rows render.
   */
  pageSize?: Signal<number>;

  /**
   * Optional 1-indexed reactive `Signal<number>` tracking the active page.
   * @default 1
   */
  currentPage?: Signal<number>;

  /**
   * When `true`, disables internal client-side array slicing.
   * Use this alongside `totalRows` and `onPageChange$` for server-side pagination.
   * @default false
   */
  manualPagination?: boolean;

  /**
   * Total record count on the backend when `manualPagination` is `true`.
   */
  totalRows?: number | Signal<number>;

  /**
   * Optional QRL callback invoked when the page changes via `paginationComponent`.
   */
  onPageChange$?: QRL<(page: number) => void>;

  /**
   * Optional headless Qwik `component$` rendered below `</table>` inside the container
   * whenever `pageSize` is configured.
   */
  paginationComponent?: Component<
    PaginationState & {
      onPageChange$: QRL<(page: number) => void>;
      onPageSizeChange$: QRL<(size: number) => void>;
      meta?: TMeta;
    }
  >;

  /** Optional slot-based CSS classes for styling table elements. */
  classNames?: TableClassNames;
}