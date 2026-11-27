import { getColumnValue, getValueByPath, isColumnVisible } from "./helper";
import { TablePipelineInput, TablePipelineOutput } from "./pipelineTypes";

export const computeTablePipeline = <
  T extends object,
  TMeta = Record<string, unknown>,
>(
  input: TablePipelineInput<T, TMeta>,
): TablePipelineOutput<T, TMeta> => {
  const {
    rows,
    columns,
    columnVisibility,
    query,
    sortState,
    manualSort,
    pageSize,
    currentPage,
    manualPagination,
    totalRows,
  } = input;

  const visibleColumns = columns.filter((col) =>
    isColumnVisible(col, columnVisibility),
  );

  const searchableColumns = visibleColumns.filter(
    (col) => col.searchable ?? !col.cellComponent,
  );

  const normalizedQuery = query.trim().toLowerCase();

  // 1. Filter across visible, searchable columns
  const filtered = normalizedQuery
    ? rows.filter((row) =>
        searchableColumns.some((col) => {
          const rawVal = getColumnValue(row, col);
          if (rawVal == null) return false;
          return String(rawVal).toLowerCase().includes(normalizedQuery);
        }),
      )
    : rows;

  // 2. Sort using column sortFn if defined, otherwise default comparison
  const sorted = (() => {
    if (manualSort) return filtered;

    const { columnId, direction } = sortState;
    if (!columnId || !direction) return filtered;

    // using columns instead of visibleColumns to preserve sorting state.
    const activeCol = columns.find((col) => String(col.id) === columnId);
    const customSortFn = activeCol?.sortFn;

    return [...filtered].sort((a, b) => {
      if (customSortFn) {
        return customSortFn(a, b, direction);
      }

      const valueA = activeCol
        ? getColumnValue(a, activeCol)
        : getValueByPath(a, columnId);
      const valueB = activeCol
        ? getColumnValue(b, activeCol)
        : getValueByPath(b, columnId);

      if (valueA == null && valueB == null) return 0;
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
      visibleColumns,
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
    visibleColumns,
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
