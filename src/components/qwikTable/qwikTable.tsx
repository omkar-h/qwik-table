import { component$, useStore, useComputed$, $ } from "@builder.io/qwik";
import type { SortState, SortDirection, QwikTableProps } from "./types";

/** Joins truthy CSS class strings cleanly without extra spaces. */
const cx = (...classes: (string | undefined)[]): string | undefined => {
  const joined = classes.filter(Boolean).join(" ");
  return joined || undefined;
};

/**
 * A headless, unstyled data table component built natively for Qwik.
 *
 * Renders clean semantic HTML `<table>` markup with zero hardcoded styles or icons,
 * supporting lazy-loaded sorting, slot-based styling, and custom QRL renderers.
 *
 * @template T - The data interface representing a single row object.
 */
export const QwikTable = component$(
  <T extends object = Record<string, unknown>>(props: QwikTableProps<T>) => {
    const sortState = useStore<SortState>({
      columnId: null,
      direction: null,
    });

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

      if (props.onSort$) {
        props.onSort$({
          columnId: sortState.columnId,
          direction: sortState.direction,
        });
      }
    });

    const sortedRows = useComputed$(() => {
      if (props.manualSort) return props.rowData;

      const { columnId, direction } = sortState;
      if (!columnId || !direction) return props.rowData;

      return [...props.rowData].sort((a, b) => {
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

                return (
                  <th
                    key={targetId}
                    onClick$={clickAction$}
                    class={cx(props.classNames?.th, col.headerClass)}
                    data-sortable={col.sortable ? "true" : undefined}
                    data-sort={currentDirection ?? undefined}
                  >
                    {col.headerRender$
                      ? col.headerRender$(col, currentDirection)
                      : col.label}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody class={props.classNames?.tbody}>
            {sortedRows.value.map((row, rowIndex) => (
              <tr key={rowIndex} class={props.classNames?.tr}>
                {props.columnConfig.map((col) => {
                  const cellValue = (row as Record<string, unknown>)[
                    String(col.id)
                  ];
                  return (
                    <td
                      key={String(col.id)}
                      class={cx(props.classNames?.td, col.cellClass)}
                    >
                      {col.render$
                        ? col.render$(cellValue, row)
                        : (cellValue as
                            | string
                            | number
                            | boolean
                            | null
                            | undefined)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  },
);
