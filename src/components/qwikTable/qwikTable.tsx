import {
  component$,
  useStore,
  useComputed$,
  isSignal,
  $,
} from "@builder.io/qwik";
import type { SortState, SortDirection, QwikTableProps } from "./types";
import { cx, getRowKey } from "./helper";

/**
 * A headless, unstyled data table component built natively for Qwik.
 *
 * Renders clean semantic HTML `<table>` markup with zero hardcoded styles or icons,
 * supporting lazy-loaded sorting, reactive signal-based search filtering, slot-based styling,
 * and custom Qwik component renderers.
 *
 * @template T - The data interface representing a single row object.
 */
export const QwikTable = component$(
  <T extends object = Record<string, unknown>>(props: QwikTableProps<T>) => {
    const sortState = useStore<SortState>({
      columnId: null,
      direction: null,
    });

    // Extract serializable values & Signals outside `$` boundaries so `useComputed$`
    // and `handleSort` never capture `props` (which holds non-serializable components).
    const rawRowData = props.rowData;
    const rawSearchQuery = props.searchQuery;
    const manualSort = Boolean(props.manualSort);
    const searchableColIds = props.columnConfig.map((col) => String(col.id));
    const onSort$ = props.onSort$;
    const EmptyComp = props.emptyComponent;

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

    // Memoized two-stage reactive pipeline: Filter -> Sort

    const processedRows = useComputed$(() => {
      const currentRows = isSignal(rawRowData) ? rawRowData.value : rawRowData;
      const currentQuery = (
        isSignal(rawSearchQuery) ? rawSearchQuery.value : (rawSearchQuery ?? "")
      )
        .trim()
        .toLowerCase();

      const filtered = currentQuery
        ? currentRows.filter((row) =>
            searchableColIds.some((colId) => {
              const rawVal = (row as Record<string, unknown>)[colId];
              if (rawVal == null) return false;
              return String(rawVal).toLowerCase().includes(currentQuery);
            }),
          )
        : currentRows;

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
    });

    return (
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

                const HeaderComp = col.headerComponent;

                return (
                  <th
                    key={targetId}
                    onClick$={clickAction$}
                    class={cx(props.classNames?.th, col.headerClass)}
                    data-sortable={col.sortable ? "true" : undefined}
                    data-sort={currentDirection ?? undefined}
                  >
                    {HeaderComp ? (
                      <HeaderComp
                        column={col}
                        sortDirection={currentDirection}
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
            {processedRows.value.length === 0 ? (
              <tr class={props.classNames?.emptyRow}>
                <td
                  colSpan={props.columnConfig.length}
                  class={props.classNames?.emptyCell}
                >
                  {EmptyComp ? <EmptyComp /> : "No records found."}
                </td>
              </tr>
            ) : (
              processedRows.value.map((row, rowIndex) => {
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
                            <CellComp value={cellValue} row={row} />
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
    );
  },
);
