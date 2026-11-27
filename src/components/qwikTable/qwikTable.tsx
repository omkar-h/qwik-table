import {
  $,
  component$,
  isSignal,
  useComputed$,
  useStore,
} from "@builder.io/qwik";
import { cx, getColumnValue, getRowKey, toAriaSort } from "./helper";
import { computeTablePipeline } from "./pipeline";
import {
  computeSelectionFlags,
  toggleBatchRowSelection,
  toggleSingleRowSelection,
} from "./selection";
import type { QwikTableProps, SortDirection, SortState } from "./types";

/**
 * A headless, unstyled data table component built natively for Qwik.
 *
 * Renders clean semantic HTML `<table>` markup with zero hardcoded styles or icons,
 * supporting lazy-loaded sorting, reactive signal-based search filtering, headless pagination,
 * ARIA keyboard accessibility, and custom Qwik component renderers.
 *
 * @template T - The data interface representing a single row object.
 * @template TMeta - Optional metadata or QRL action handlers forwarded to custom components.
 */
export const QwikTable = component$(
  <T extends object = Record<string, unknown>, TMeta = Record<string, unknown>>(
    props: QwikTableProps<T, TMeta>,
  ) => {
    const sortState = useStore<SortState>({ columnId: null, direction: null });

    // Extract serializable values & Signals outside `$` boundaries so `useComputed$`
    // and event handlers never capture `props` (which holds non-serializable components/meta).
    const rawRowData = props.rowData;
    const rawSearchQuery = props.searchQuery;
    const manualSort = Boolean(props.manualSort);
    const rawPageSize = props.pageSize;
    const rawCurrentPage = props.currentPage;
    const rawTotalRows = props.totalRows;
    const manualPagination = Boolean(props.manualPagination);
    const columns = props.columnConfig;
    const rawColumnVisibility = props.columnVisibility;
    const rowKeyFields = props.rowKey;
    const rowSelection = props.rowSelection;
    const selectionMode = props.selectionMode ?? "multiple";
    const onRowSelectionChange$ = props.onRowSelectionChange$;
    const onSort$ = props.onSort$;
    const onPageChange$ = props.onPageChange$;
    const EmptyComp = props.emptyComponent;
    const PaginationComp = props.paginationComponent;
    const tableMeta = props.meta;

    const handleSort = $((columnId: string) => {
      if (sortState.columnId !== columnId) {
        sortState.columnId = columnId;
        sortState.direction = "asc";
      } else if (sortState.direction === "asc") {
        sortState.direction = "desc";
      } else {
        sortState.columnId = null;
        sortState.direction = null;
      }
      onSort$?.({
        columnId: sortState.columnId,
        direction: sortState.direction,
      });
    });

    const handlePageChange = $((nextPage: number) => {
      const safePage = Math.max(1, Math.floor(nextPage));
      if (rawCurrentPage) rawCurrentPage.value = safePage;
      onPageChange$?.(safePage);
    });

    const handlePageSizeChange = $((nextSize: number) => {
      const safeSize = Math.max(1, Math.floor(nextSize));
      if (rawPageSize) rawPageSize.value = safeSize;
      if (rawCurrentPage) rawCurrentPage.value = 1;
      onPageChange$?.(1);
    });

    const tableState = useComputed$(() => {
      const currentRows = isSignal(rawRowData) ? rawRowData.value : rawRowData;
      // Subscribe to useStore array mutations (.splice, .push, .pop) in O(1) time
      void currentRows.length;

      return computeTablePipeline({
        rows: currentRows,
        columns,
        columnVisibility: rawColumnVisibility?.value,
        query: isSignal(rawSearchQuery)
          ? rawSearchQuery.value
          : (rawSearchQuery ?? ""),
        sortState,
        manualSort,
        pageSize: rawPageSize ? rawPageSize.value : 0,
        currentPage: rawCurrentPage ? rawCurrentPage.value : 1,
        manualPagination,
        totalRows: isSignal(rawTotalRows) ? rawTotalRows.value : rawTotalRows,
      });
    });

    const handleToggleRow = $((targetRowId: string) => {
      if (!rowSelection) return;
      const ids = toggleSingleRowSelection(
        rowSelection,
        targetRowId,
        selectionMode,
      );
      onRowSelectionChange$?.(ids);
    });

    const toggleVisibleRows$ = $(() => {
      if (!rowSelection || selectionMode === "single") return;
      const ids = toggleBatchRowSelection(
        rowSelection,
        tableState.value.visibleRows,
        rowKeyFields,
      );
      onRowSelectionChange$?.(ids);
    });

    const toggleAllRows$ = $(() => {
      if (!rowSelection || selectionMode === "single") return;
      const ids = toggleBatchRowSelection(
        rowSelection,
        tableState.value.allRows,
        rowKeyFields,
      );
      onRowSelectionChange$?.(ids);
    });

    const selectionMap = rowSelection?.value;
    const pageRows = tableState.value.visibleRows;
    const visibleColumns = tableState.value.visibleColumns;
    const selectionFlags = computeSelectionFlags(
      selectionMap,
      pageRows,
      tableState.value.allRows,
      rowKeyFields,
    );

    return (
      <>
        <div class={props.classNames?.container}>
          <table class={props.classNames?.table}>
            <thead class={props.classNames?.thead}>
              <tr class={props.classNames?.headerRow}>
                {visibleColumns.map((col) => {
                  const targetId = String(col.id);
                  const currentDirection: SortDirection =
                    sortState.columnId === targetId
                      ? sortState.direction
                      : null;

                  const clickAction$ = col.sortable
                    ? $(() => handleSort(targetId))
                    : undefined;

                  const keyDownAction$ = col.sortable
                    ? $((event: KeyboardEvent) => {
                        if (event.key === "Enter" || event.key === " ") {
                          handleSort(targetId);
                        }
                      })
                    : undefined;

                  const HeaderComp = col.headerComponent;

                  return (
                    <th
                      key={targetId}
                      onClick$={clickAction$}
                      onKeyDown$={keyDownAction$}
                      tabIndex={col.sortable ? 0 : undefined}
                      aria-sort={toAriaSort(col.sortable, currentDirection)}
                      class={cx(props.classNames?.th, col.headerClass)}
                      data-sortable={col.sortable ? "true" : undefined}
                      data-sort={currentDirection ?? undefined}
                    >
                      {HeaderComp ? (
                        <HeaderComp
                          column={col}
                          sortDirection={currentDirection}
                          {...selectionFlags}
                          toggleVisibleRows$={toggleVisibleRows$}
                          toggleAllRows$={toggleAllRows$}
                          meta={tableMeta}
                        />
                      ) : (
                        col.label
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody class={props.classNames?.tbody}>
              {pageRows.length === 0 ? (
                <tr class={props.classNames?.emptyRow}>
                  <td
                    colSpan={Math.max(1, visibleColumns.length)}
                    class={props.classNames?.emptyCell}
                  >
                    {EmptyComp ? <EmptyComp /> : "No records found."}
                  </td>
                </tr>
              ) : (
                pageRows.map((row, rowIndex) => {
                  const rowId = getRowKey(row, rowIndex, rowKeyFields);
                  const isSelected = Boolean(selectionMap?.[rowId]);

                  return (
                    <tr
                      key={rowId}
                      data-selected={isSelected ? "true" : undefined}
                      class={cx(
                        props.classNames?.tr,
                        isSelected ? props.classNames?.selectedTr : undefined,
                      )}
                    >
                      {visibleColumns.map((col) => {
                        const colKey = String(col.id);
                        const CellComp = col.cellComponent;
                        const cellValue = CellComp
                          ? undefined
                          : getColumnValue(row, col);
                        return (
                          <td
                            key={colKey}
                            class={cx(props.classNames?.td, col.cellClass)}
                          >
                            {CellComp ? (
                              <CellComp
                                row={row}
                                column={col}
                                rowId={rowId}
                                isSelected={isSelected}
                                toggleRow$={handleToggleRow}
                                meta={tableMeta}
                              />
                            ) : (
                              (cellValue as
                                | string
                                | number
                                | boolean
                                | null
                                | undefined)
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {tableState.value.pagination && PaginationComp && (
          <PaginationComp
            {...tableState.value.pagination}
            onPageChange$={handlePageChange}
            onPageSizeChange$={handlePageSizeChange}
            meta={tableMeta}
          />
        )}
      </>
    );
  },
);
