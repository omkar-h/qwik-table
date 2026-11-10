import { component$, useStore, useComputed$, $ } from "@builder.io/qwik";

export interface ColumnConfig<T = Record<string, unknown>> {
  id: Extract<keyof T, string | number> | string;
  label: string;
  sortable?: boolean;
}

export interface QwikTableProps<T = Record<string, unknown>> {
  rowData: T[];
  columnConfig: ColumnConfig<T>[];
}

export interface SortState {
  columnId: string | null;
  direction: "asc" | "desc" | null;
}

export const QwikTable = component$<QwikTableProps>((props) => {
  const sortState = useStore<SortState>({
    columnId: null,
    direction: null,
  });

  const handleSort = $((columnId: string) => {
    if (!(sortState.columnId === columnId)) {
      sortState.columnId = columnId;
      sortState.direction = "asc";
      return;
    }

    // clicked on same colID
    if (sortState.direction === "asc") {
      sortState.direction = "desc";
    } else if (sortState.direction === "desc") {
      sortState.columnId = null;
      sortState.direction = null;
    }
  });

  const sortedRows = useComputed$(() => {
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
                    {cellValue as string | number | boolean | null | undefined}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});
