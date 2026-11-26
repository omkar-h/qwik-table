import type { PaginationState, SortState } from "./types";

export interface TablePipelineInput<T> {
  rows: T[];
  query: string;
  searchableColIds: string[];
  sortState: SortState;
  manualSort: boolean;
  pageSize: number;
  currentPage: number;
  manualPagination: boolean;
  totalRows?: number;
}

export interface TablePipelineOutput<T> {
  visibleRows: T[];
  allRows: T[];
  pagination: PaginationState | null;
}

export const computeTablePipeline = <T extends object>(
  input: TablePipelineInput<T>,
): TablePipelineOutput<T> => {
  const {
    rows,
    query,
    searchableColIds,
    sortState,
    manualSort,
    pageSize,
    currentPage,
    manualPagination,
    totalRows,
  } = input;

  const normalizedQuery = query.trim().toLowerCase();

  // 1. Filter
  const filtered = normalizedQuery
    ? rows.filter((row) =>
        searchableColIds.some((colId) => {
          const rawVal = (row as Record<string, unknown>)[colId];
          if (rawVal == null) return false;
          return String(rawVal).toLowerCase().includes(normalizedQuery);
        }),
      )
    : rows;

  // 2. Sort
  const sorted = (() => {
    if (manualSort) return filtered;

    const { columnId, direction } = sortState;
    if (!columnId || !direction) return filtered;

    return [...filtered].sort((a, b) => {
      const valueA = (a as Record<string, unknown>)[columnId];
      const valueB = (b as Record<string, unknown>)[columnId];

      if (valueA == null) return 1;
      if (valueB == null) return -1;

      if (valueA < valueB) return direction === "asc" ? -1 : 1;
      if (valueA > valueB) return direction === "asc" ? 1 : -1;
      return 0;
    });
  })();

  // 3. Paginate
  const resolvedTotalRows = manualPagination
    ? (totalRows ?? sorted.length)
    : sorted.length;

  if (!pageSize || pageSize <= 0) {
    return {
      visibleRows: sorted,
      allRows: sorted,
      pagination: null,
    };
  }

  const totalPages = Math.max(1, Math.ceil(resolvedTotalRows / pageSize));
  const clampedPage = Math.min(Math.max(1, currentPage), totalPages);

  const visibleRows = manualPagination
    ? sorted
    : sorted.slice((clampedPage - 1) * pageSize, clampedPage * pageSize);

  return {
    visibleRows,
    allRows: sorted,
    pagination: {
      currentPage: clampedPage,
      pageSize,
      totalRows: resolvedTotalRows,
      totalPages,
    },
  };
};
