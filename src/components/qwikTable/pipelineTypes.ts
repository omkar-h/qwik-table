import {
  ColumnConfig,
  ColumnVisibilityMap,
  SortState,
  PaginationState,
} from "./types";

export interface TablePipelineInput<
  T extends object,
  TMeta = Record<string, unknown>,
> {
  rows: T[];
  columns: ColumnConfig<T, TMeta>[];
  columnVisibility?: ColumnVisibilityMap;
  query: string;
  sortState: SortState;
  manualSort: boolean;
  pageSize: number;
  currentPage: number;
  manualPagination: boolean;
  totalRows?: number;
}

export interface TablePipelineOutput<
  T extends object,
  TMeta = Record<string, unknown>,
> {
  visibleColumns: ColumnConfig<T, TMeta>[];
  visibleRows: T[];
  allRows: T[];
  pagination: PaginationState | null;
}
