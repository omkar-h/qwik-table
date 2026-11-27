# qwik-table-core

[![npm version](https://img.shields.io/npm/v/qwik-table-core.svg)](https://www.npmjs.com/package/qwik-table-core)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/omkar-h/qwik-table/blob/main/LICENSE)

`qwik-table-core` is a headless, zero-hydration data table library for Qwik. It provides search, sorting, pagination, row selection, custom renderers, and slot-based styling in an approximately 3.2 kB gzipped package.

| Section                                                          |                                                                      |
| ---------------------------------------------------------------- | -------------------------------------------------------------------- |
| [Installation](#installation)                                    | [Quick Start](#quick-start)                                          |
| [Core Features & Usage Examples](#core-features--usage-examples) | [Complete Props & Types Reference](#complete-props--types-reference) |
| [Performance Guidelines](#performance-guidelines)                | [License](#license)                                                  |

## Installation

```bash
pnpm add qwik-table-core
```

```bash
npm install qwik-table-core
```

## Quick Start

```tsx
import { component$ } from "@builder.io/qwik";
import { QwikTable, type ColumnConfig } from "qwik-table-core";

interface User {
  id: number;
  name: string;
  email: string;
}

export default component$(() => {
  const rowData: User[] = [
    { id: 1, name: "Ada Lovelace", email: "ada@example.com" },
    { id: 2, name: "Grace Hopper", email: "grace@example.com" },
  ];

  const columnConfig: ColumnConfig<User>[] = [
    { id: "name", label: "Name", sortable: true, searchable: true },
    { id: "email", label: "Email", searchable: true },
  ];

  return (
    <QwikTable rowData={rowData} columnConfig={columnConfig} rowKey={["id"]} />
  );
});
```

## Core Features & Usage Examples

### Signal-based Search

Pass `searchQuery` as a string or a `Signal<string>`. Filtering is case-insensitive and checks columns whose `searchable` flag is enabled. `searchable` defaults to `true` for columns without a `cellComponent` and `false` for columns with a `cellComponent`.

```tsx
import { component$, useSignal } from "@builder.io/qwik";
import { QwikTable, type ColumnConfig } from "qwik-table-core";

interface User {
  id: number;
  name: string;
  email: string;
}

export default component$(() => {
  const searchQuery = useSignal("");
  const rowData: User[] = [
    { id: 1, name: "Ada Lovelace", email: "ada@example.com" },
  ];
  const columnConfig: ColumnConfig<User>[] = [
    { id: "name", label: "Name", searchable: true },
    { id: "email", label: "Email", searchable: false },
  ];

  return (
    <>
      <input bind:value={searchQuery} aria-label="Search users" />
      <QwikTable
        rowData={rowData}
        columnConfig={columnConfig}
        rowKey={["id"]}
        searchQuery={searchQuery}
      />
    </>
  );
});
```

### Client & Server Sorting

Set `sortable: true` on a column for client-side sorting. Header clicks and `Enter`/`Space` key presses cycle through `asc`, `desc`, and `null`. Sortable headers receive `aria-sort` and `data-sortable="true"` attributes.

```tsx
import { $, component$ } from "@builder.io/qwik";
import { QwikTable, type ColumnConfig, type SortState } from "qwik-table-core";

const columns: ColumnConfig<{ id: number; name: string }>[] = [
  { id: "name", label: "Name", sortable: true },
];

export default component$(() => {
  const onSort$ = $((sortState: SortState) => {
    // Fetch sorted server data here.
  });

  return (
    <QwikTable
      rowData={[{ id: 1, name: "Ada Lovelace" }]}
      columnConfig={columns}
      rowKey={["id"]}
      onSort$={onSort$}
    />
  );
});
```

Set `manualSort` to `true` to disable client sorting and use `onSort$` for server-side sorting:

```tsx
<QwikTable
  rowData={serverRows}
  columnConfig={columns}
  rowKey={["id"]}
  manualSort
  onSort$={onSort$}
/>
```

### Client & Server Pagination

Pass `pageSize` and `currentPage` as `Signal<number>` values and provide a `paginationComponent`. When `pageSize` is omitted or `<= 0`, pagination is disabled and all matching rows are rendered.

```tsx
import { component$, useSignal, type QRL } from "@builder.io/qwik";
import {
  QwikTable,
  type PaginationState,
  type ColumnConfig,
} from "qwik-table-core";

interface Row {
  id: number;
  name: string;
}

const Pagination = component$<
  PaginationState & {
    onPageChange$: QRL<(page: number) => void>;
    onPageSizeChange$: QRL<(size: number) => void>;
  }
>((props) => (
  <nav>
    <button
      disabled={props.currentPage <= 1}
      onClick$={() => props.onPageChange$(props.currentPage - 1)}
    >
      Previous
    </button>
    <span>
      {props.currentPage} / {props.totalPages}
    </span>
    <button
      disabled={props.currentPage >= props.totalPages}
      onClick$={() => props.onPageChange$(props.currentPage + 1)}
    >
      Next
    </button>
  </nav>
));

export default component$(() => {
  const currentPage = useSignal(1);
  const pageSize = useSignal(10);
  const rowData: Row[] = [{ id: 1, name: "Ada Lovelace" }];
  const columnConfig: ColumnConfig<Row>[] = [{ id: "name", label: "Name" }];

  return (
    <QwikTable
      rowData={rowData}
      columnConfig={columnConfig}
      rowKey={["id"]}
      currentPage={currentPage}
      pageSize={pageSize}
      paginationComponent={Pagination}
    />
  );
});
```

For server-side pagination, set `manualPagination` and `totalRows`, then handle page changes with `onPageChange$`. The table does not slice `rowData` in this mode:

```tsx
import { $, component$, useSignal } from "@builder.io/qwik";
import { QwikTable } from "qwik-table-core";

export default component$(() => {
  const currentPage = useSignal(1);
  const pageSize = useSignal(10);
  const onPageChange$ = $((page: number) => {
    // Fetch the requested server page.
  });

  return (
    <QwikTable
      rowData={serverRows}
      columnConfig={columns}
      rowKey={["id"]}
      manualPagination
      totalRows={serverTotalRows}
      currentPage={currentPage}
      pageSize={pageSize}
      onPageChange$={onPageChange$}
      paginationComponent={Pagination}
    />
  );
});
```

### Headless Row Selection

Pass a `Signal<Record<string, boolean>>` to `rowSelection`. Keys are composite `rowKey` values. Use `selectionMode="multiple"` for batch selection or `selectionMode="single"` for at most one selected row. `onRowSelectionChange$` receives the currently selected row IDs.

Selected rows set `data-selected="true"` and receive `classNames.selectedTr` in addition to `classNames.tr`.

```tsx
import { component$, useSignal, $ } from "@builder.io/qwik";
import { QwikTable, type ColumnConfig } from "qwik-table-core";

interface User {
  id: number;
  name: string;
}

const SelectHeader = component$<{
  isAllPageSelected: boolean;
  isSomePageSelected: boolean;
  toggleVisibleRows$: import("@builder.io/qwik").QRL<() => void>;
}>((props) => (
  <input
    type="checkbox"
    checked={props.isAllPageSelected}
    aria-checked={props.isSomePageSelected ? "mixed" : props.isAllPageSelected}
    onChange$={() => props.toggleVisibleRows$()}
  />
));

const SelectCell = component$<{
  rowId: string;
  isSelected: boolean;
  toggleRow$: import("@builder.io/qwik").QRL<(rowId: string) => void>;
}>((props) => (
  <input
    type="checkbox"
    checked={props.isSelected}
    onChange$={() => props.toggleRow$(props.rowId)}
  />
));

export default component$(() => {
  const rowSelection = useSignal<Record<string, boolean>>({});
  const onRowSelectionChange$ = $((selectedRowIds: string[]) => {
    // `selectedRowIds` contains the composite rowKey values.
  });
  const columnConfig: ColumnConfig<User>[] = [
    {
      id: "select",
      label: "",
      headerComponent: SelectHeader,
      cellComponent: SelectCell,
      searchable: false,
    },
    { id: "name", label: "Name" },
  ];

  return (
    <QwikTable
      rowData={[{ id: 1, name: "Ada Lovelace" }]}
      columnConfig={columnConfig}
      rowKey={["id"]}
      rowSelection={rowSelection}
      selectionMode="multiple"
      onRowSelectionChange$={onRowSelectionChange$}
    />
  );
});
```

Header components also receive `isAllRowsSelected` and `toggleAllRows$`. `toggleVisibleRows$` toggles the current page; `toggleAllRows$` toggles all filtered/sorted rows. In `selectionMode="single"`, both batch toggle handlers are no-ops.

### Custom Header & Cell Components + `meta`

Use `QwikTable<T, TMeta>` for typed custom renderers. `headerComponent` receives `column`, `sortDirection`, selection state, selection toggle QRLs, and `meta`. `cellComponent` receives `row`, `column`, `rowId`, `isSelected`, `toggleRow$`, and `meta`. The same `meta` value is also forwarded to `paginationComponent`.

```tsx
import { $, component$, type QRL } from "@builder.io/qwik";
import { QwikTable, type ColumnConfig } from "qwik-table-core";

interface User {
  id: number;
  name: string;
}

interface TableMeta {
  onDelete$: QRL<(row: User) => void>;
}

const NameCell = component$<{
  row: User;
  meta?: TableMeta;
}>((props) => (
  <button onClick$={() => props.meta?.onDelete$(props.row)}>
    Delete {props.row.name}
  </button>
));

export default component$(() => {
  const rowData: User[] = [{ id: 1, name: "Ada Lovelace" }];
  const onDelete$ = $((row: User) => {
    // Delete `row`.
  });
  const columnConfig: ColumnConfig<User, TableMeta>[] = [
    {
      id: "name",
      label: "Name",
      cellComponent: NameCell,
    },
  ];

  return (
    <QwikTable<User, TableMeta>
      rowData={rowData}
      columnConfig={columnConfig}
      rowKey={["id"]}
      meta={{ onDelete$ }}
    />
  );
});
```

### Styling via `classNames`

`classNames` applies CSS classes to named table slots. `headerClass` and `cellClass` are appended to the corresponding default classes.

```tsx
<QwikTable
  rowData={rowData}
  columnConfig={columnConfig}
  rowKey={["id"]}
  classNames={{
    container: "table-container",
    table: "table",
    thead: "table-head",
    headerRow: "table-header-row",
    th: "table-header-cell",
    tbody: "table-body",
    tr: "table-row",
    selectedTr: "table-row-selected",
    td: "table-cell",
    emptyRow: "table-empty-row",
    emptyCell: "table-empty-cell",
  }}
/>
```

## Complete Props & Types Reference

### `QwikTableProps`

| Prop                    | Type                                                                                                                                        | Required | Default      | Description                                                                    |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | :------: | ------------ | ------------------------------------------------------------------------------ |
| `rowData`               | `T[] \| Signal<T[]>`                                                                                                                        |   Yes    | -            | Row objects to render.                                                         |
| `columnConfig`          | `ColumnConfig<T, TMeta>[]`                                                                                                                  |   Yes    | -            | Column definitions and renderers.                                              |
| `rowKey`                | `Extract<keyof T, string \| number>[]`                                                                                                      |   Yes    | -            | Property keys used to build the composite DOM key for each row.                |
| `searchQuery`           | `string \| Signal<string>`                                                                                                                  |    No    | `""`         | Case-insensitive search value.                                                 |
| `meta`                  | `TMeta`                                                                                                                                     |    No    | -            | Metadata or QRL handlers forwarded to header, cell, and pagination components. |
| `rowSelection`          | `Signal<Record<string, boolean>>`                                                                                                           |    No    | -            | Selected state keyed by composite `rowKey` string.                             |
| `selectionMode`         | `"multiple" \| "single"`                                                                                                                    |    No    | `"multiple"` | Whether multiple or at most one row can be selected.                           |
| `onRowSelectionChange$` | `QRL<(selectedRowIds: string[]) => void>`                                                                                                   |    No    | -            | Called when selection changes.                                                 |
| `emptyComponent`        | `Component<object>`                                                                                                                         |    No    | -            | Rendered when there are no matching records.                                   |
| `onSort$`               | `QRL<(sortState: SortState) => void>`                                                                                                       |    No    | -            | Called when a sortable header is activated.                                    |
| `manualSort`            | `boolean`                                                                                                                                   |    No    | `false`      | Disables internal sorting.                                                     |
| `pageSize`              | `Signal<number>`                                                                                                                            |    No    | -            | Rows per page; omitted or `<= 0` disables pagination.                          |
| `currentPage`           | `Signal<number>`                                                                                                                            |    No    | `1`          | 1-indexed active page.                                                         |
| `manualPagination`      | `boolean`                                                                                                                                   |    No    | `false`      | Disables internal slicing for server pagination.                               |
| `totalRows`             | `number \| Signal<number>`                                                                                                                  |    No    | -            | Backend row count used when `manualPagination` is `true`.                      |
| `onPageChange$`         | `QRL<(page: number) => void>`                                                                                                               |    No    | -            | Called when the pagination component changes the page or page size.            |
| `paginationComponent`   | `Component<PaginationState & { onPageChange$: QRL<(page: number) => void>; onPageSizeChange$: QRL<(size: number) => void>; meta?: TMeta }>` |    No    | -            | Rendered below the table when pagination is active.                            |
| `classNames`            | `TableClassNames`                                                                                                                           |    No    | -            | Slot-based CSS classes.                                                        |

### `ColumnConfig`

| Prop              | Type                                                                                                                                                                                                                                                   | Required | Description                                                                                                                     |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :------: | ------------------------------------------------------------------------------------------------------------------------------- |
| `id`              | `Extract<keyof T, string \| number> \| string`                                                                                                                                                                                                         |   Yes    | Row property key or virtual column identifier.                                                                                  |
| `label`           | `string`                                                                                                                                                                                                                                               |   Yes    | Header text used when `headerComponent` is omitted.                                                                             |
| `sortable`        | `boolean`                                                                                                                                                                                                                                              |    No    | Enables header sorting. Default: `false`.                                                                                       |
| `searchable`      | `boolean`                                                                                                                                                                                                                                              |    No    | Includes the column in search filtering. Plain text columns default to `true`; columns with `cellComponent` default to `false`. |
| `headerClass`     | `string`                                                                                                                                                                                                                                               |    No    | CSS class appended to this column's header.                                                                                     |
| `cellClass`       | `string`                                                                                                                                                                                                                                               |    No    | CSS class appended to this column's cells.                                                                                      |
| `headerComponent` | `Component<{ column: ColumnConfig<T, TMeta>; sortDirection: SortDirection; isAllPageSelected: boolean; isSomePageSelected: boolean; toggleVisibleRows$: QRL<() => void>; isAllRowsSelected: boolean; toggleAllRows$: QRL<() => void>; meta?: TMeta }>` |    No    | Custom header renderer.                                                                                                         |
| `cellComponent`   | `Component<{ row: T; column: ColumnConfig<T, TMeta>; rowId: string; isSelected: boolean; toggleRow$: QRL<(rowId: string) => void>; meta?: TMeta }>`                                                                                                    |    No    | Custom cell renderer.                                                                                                           |

### `TableClassNames`

| Slot         | Applied element                    |
| ------------ | ---------------------------------- |
| `container`  | Outer wrapper `<div>`              |
| `table`      | `<table>`                          |
| `thead`      | `<thead>`                          |
| `headerRow`  | Header `<tr>`                      |
| `th`         | Default header `<th>`              |
| `tbody`      | `<tbody>`                          |
| `tr`         | Body `<tr>`                        |
| `selectedTr` | Appended to a selected body `<tr>` |
| `td`         | Default body `<td>`                |
| `emptyRow`   | Empty-state `<tr>`                 |
| `emptyCell`  | Empty-state `<td colSpan>`         |

### `PaginationState`

| Property      | Type     | Description                                         |
| ------------- | -------- | --------------------------------------------------- |
| `currentPage` | `number` | 1-indexed active page.                              |
| `pageSize`    | `number` | Configured rows per page.                           |
| `totalRows`   | `number` | Matching client-side rows or server-reported total. |
| `totalPages`  | `number` | Available pages, always at least `1`.               |

## Performance Guidelines

- Use `useSignal(rowData)` when the table should react to replacement or external reassignment of the complete row array. Use `useStore` for a mutable row array when components should observe additions, removals, or direct property mutations; pass QRL handlers outside row objects and into `meta`.
- Pass QRL handlers and shared configuration through `meta` instead of creating non-QRL closures across the table API.
- Keep `pageSize` large enough to avoid unnecessary visible rows, and use `manualPagination` with `totalRows` for server-managed datasets.
- Use one or more unique, stable `rowKey` properties. Composite keys produce a stable row ID and are used by selection state.

## License

MIT © Omkar D. Hankare
