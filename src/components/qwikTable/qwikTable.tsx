import {
  component$,
  useStore,
  useComputed$,
  isSignal,
  $,
} from "@builder.io/qwik";
import type {
  SortState,
  SortDirection,
  QwikTableProps,
  PaginationState,
} from "./types";
import { cx, getRowKey, toAriaSort } from "./helper";

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
    const sortState = useStore<SortState>({
      columnId: null,
      direction: null,
    });

    // Extract serializable values & Signals outside `$` boundaries so `useComputed$`
    // and event handlers never capture `props` (which holds non-serializable components/meta).
    const rawRowData = props.rowData;
    const rawSearchQuery = props.searchQuery;
    const manualSort = Boolean(props.manualSort);
    const rawPageSize = props.pageSize;
    const rawCurrentPage = props.currentPage;
    const rawTotalRows = props.totalRows;
    const manualPagination = Boolean(props.manualPagination);
    const searchableColIds = props.columnConfig.map((col) => String(col.id));
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
      } else if (sortState.direction === "desc") {
        sortState.columnId = null;
        sortState.direction = null;
      }

      if (onSort$) {
        onSort$({
          columnId: sortState.columnId,
          direction: sortState.direction,
        });
      }
    });

    const handlePageChange = $((nextPage: number) => {
      const safePage = Math.max(1, Math.floor(nextPage));
      if (rawCurrentPage) {
        rawCurrentPage.value = safePage;
      }
      if (onPageChange$) {
        onPageChange$(safePage);
      }
    });

    const handlePageSizeChange = $((nextSize: number) => {
      const safeSize = Math.max(1, Math.floor(nextSize));
      if (rawPageSize) {
        rawPageSize.value = safeSize;
      }
      if (rawCurrentPage) {
        rawCurrentPage.value = 1;
      }
      if (onPageChange$) {
        onPageChange$(1);
      }
    });

    // Memoized three-stage reactive pipeline: Filter -> Sort -> Paginate
    const tableState = useComputed$(() => {
      const currentRows = isSignal(rawRowData) ? rawRowData.value : rawRowData;
      // Subscribe to useStore array mutations (.splice, .push, .pop) in O(1) time
      void currentRows.length;

      const currentQuery = (
        isSignal(rawSearchQuery) ? rawSearchQuery.value : (rawSearchQuery ?? "")
      )
        ?.trim()
        ?.toLowerCase();

      // 1. Filter
      const filtered = currentQuery
        ? currentRows?.filter((row) =>
            searchableColIds?.some((colId) => {
              const rawVal = (row as Record<string, unknown>)[colId];
              if (rawVal == null) return false;
              return String(rawVal)?.toLowerCase()?.includes(currentQuery);
            }),
          )
        : currentRows;

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
      const resolvedPageSize = rawPageSize ? rawPageSize.value : 0;

      const resolvedTotalRows = manualPagination
        ? isSignal(rawTotalRows)
          ? rawTotalRows.value
          : (rawTotalRows ?? sorted.length)
        : sorted.length;

      if (!resolvedPageSize || resolvedPageSize <= 0) {
        return {
          rows: sorted,
          pagination: null as PaginationState | null,
        };
      }

      const totalPages = Math.max(
        1,
        Math.ceil(resolvedTotalRows / resolvedPageSize),
      );

      const requestedPage = rawCurrentPage ? rawCurrentPage.value : 1;
      const clampedPage = Math.min(Math.max(1, requestedPage), totalPages);

      const visibleRows = manualPagination
        ? sorted
        : sorted.slice(
            (clampedPage - 1) * resolvedPageSize,
            clampedPage * resolvedPageSize,
          );

      return {
        rows: visibleRows,
        pagination: {
          currentPage: clampedPage,
          pageSize: resolvedPageSize,
          totalRows: resolvedTotalRows,
          totalPages,
        } satisfies PaginationState,
      };
    });

    return (
      <>
        <div class={props.classNames?.container}>
          <table class={props.classNames?.table}>
            <thead class={props.classNames?.thead}>
              <tr class={props.classNames?.headerRow}>
                {props.columnConfig.map((col) => {
                  const targetId = String(col.id);
                  const isCurrentSort = sortState.columnId === targetId;
                  const currentDirection: SortDirection = isCurrentSort
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
              {tableState.value.rows.length === 0 ? (
                <tr class={props.classNames?.emptyRow}>
                  <td
                    colSpan={props.columnConfig.length}
                    class={props.classNames?.emptyCell}
                  >
                    {EmptyComp ? <EmptyComp /> : "No records found."}
                  </td>
                </tr>
              ) : (
                tableState.value.rows.map((row, rowIndex) => {
                  const rowKey = getRowKey(row, rowIndex, props.rowKey);
                  return (
                    <tr key={rowKey} class={props.classNames?.tr}>
                      {props.columnConfig.map((col) => {
                        const cellValue = (row as Record<string, unknown>)[
                          String(col.id)
                        ];
                        const CellComp = col.cellComponent;

                        return (
                          <td
                            key={String(col.id)}
                            class={cx(props.classNames?.td, col.cellClass)}
                          >
                            {CellComp ? (
                              <CellComp
                                value={cellValue}
                                row={row}
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
