import { component$ } from "@builder.io/qwik";

export interface ColumnConfig<T = Record<string, unknown>> {
  // Enforce that id must map to a valid string/number key of T, or fallback to string
  id: Extract<keyof T, string | number> | string;
  label: string;
}

// 2. Apply the same uniform fallback type to the component Props
export interface QwikTableProps<T = Record<string, unknown>> {
  rowData: T[];
  columnConfig: ColumnConfig<T>[];
}

export const QwikTable = component$<QwikTableProps>((props) => {
  return (
    <div>
      <table>
        <thead>
          <tr>
            {props.columnConfig.map((col) => (
              <th key={col.id}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {props.rowData.map((row, rowIndex) => (
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
