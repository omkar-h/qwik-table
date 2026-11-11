import { component$, useStore, useComputed$, $ } from "@builder.io/qwik";
import type { SortState, QwikTableProps } from "./types";

/**
 * A headless, zero-hydration data table component built natively for Qwik.
 *
 * Renders semantic HTML `<table>` markup without opinionated styles, supporting
 * lazy-loaded single-column sorting, custom QRL cell renderers, and server-side
 * manual sorting hooks.
 *
 * @template T - The data interface representing a single row object.
 *
 * @example
 * // 1. Inline column configuration (automatic type inference)
 * <QwikTable
 *   rowData={users}
 *   columnConfig={[
 *     { id: "firstName", label: "First Name", sortable: true },
 *     { id: "age", label: "Age", render$: $((val) => <b>{String(val)}</b>) },
 *   ]}
 * />
 *
 * @example
 * // 2. Extracted column configuration (explicit generic typing)
 * const columns: ColumnConfig<User>[] = [
 *   { id: "firstName", label: "First Name", sortable: true },
 * ];
 * <QwikTable rowData={users} columnConfig={columns} />
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
      <div>
        <table>
          <thead>
            <tr>
              {props.columnConfig.map((col) => {
                const isCurrentSort = sortState.columnId === String(col.id);
                const targetId = String(col.id);

                const clickAction$ = col.sortable
                  ? $(() => handleSort(targetId))
                  : undefined;

                return (
                  <th
                    key={targetId}
                    onClick$={clickAction$}
                    style={
                      col.sortable
                        ? { cursor: "pointer", userSelect: "none" }
                        : undefined
                    }
                  >
                    {col.label}
                    {isCurrentSort &&
                      (sortState.direction === "asc" ? " ▲" : " ▼")}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {sortedRows.value.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {props.columnConfig.map((col) => {
                  const cellValue = (row as Record<string, unknown>)[
                    String(col.id)
                  ];
                  return (
                    <td key={String(col.id)}>
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
