[![npm version](https://shields.io)](https://npmjs.com)
[![npm downloads](https://shields.io)](https://npmjs.com)
# qwik-table-core

A **headless, zero-hydration data table component** built natively for [Qwik](https://qwik.dev).

`qwik-table-core` leverages Qwik's resumable architecture, `Signal` forwarding, and lazy-loaded QRLs (`$`) so your tables render cleanly on the server and execute zero client-side JavaScript until the user interacts with them.

## Features

- **Zero Hydration Overhead:** Ships pure HTML `<table>` markup with zero hardcoded styles, wrappers, or icons.
- **Headless Pagination:** Reactive `Signal<number>` support for `currentPage` and `pageSize` (`Filter → Sort → Paginate`), automatic page clamping, `manualPagination` for server-side APIs, and a custom `paginationComponent` render slot.
- **Fine-Grained `Signal` Search:** Pass a reactive `Signal<string>` to `searchQuery` to filter rows across columns without re-rendering parent components.
- **Accessible Lazy-Loaded Sorting:** Click or keyboard (`Enter` / `Space`) sorting (`asc` → `desc` → `null`) with automatic `aria-sort` attributes and `manualSort` support.
- **Typed `meta` Action Forwarding:** Pass row-level `QRL` handlers (such as `onDelete$` or `onEdit$`) or shared metadata directly into custom header, cell, and pagination components without Context boilerplate.
- **Composite Row Keys (`rowKey`):** Preserves component state and input focus across sort, filter, and pagination operations via stable composite DOM keys.
- **Tailwind & CSS Ready:** Full slot-based `classNames`, per-column `headerClass` / `cellClass` overrides, and `data-sort` / `data-sortable` attributes.

---

## Installation

```bash
npm install qwik-table-core
# or
pnpm add qwik-table-core
# or
yarn add qwik-table-core
```

---

## Quick Start

```tsx
import { component$, useSignal } from "@builder.io/qwik";
import {
  QwikTable,
  type ColumnConfig,
  type SortDirection,
} from "qwik-table-core";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
}

const AgeCell = component$<{ value: unknown }>((props) => (
  <span class="font-semibold text-emerald-600">{String(props.value)} yrs</span>
));

const FirstNameHeader = component$<{
  column: ColumnConfig<User>;
  sortDirection: SortDirection;
}>((props) => (
  <span>
    {props.column.label}{" "}
    {props.sortDirection === "asc"
      ? "↑"
      : props.sortDirection === "desc"
        ? "↓"
        : "↕"}
  </span>
));

export default component$(() => {
  const searchQuery = useSignal("");

  const users: User[] = [
    { id: "1", firstName: "Aarav", lastName: "Joshi", age: 28 },
    { id: "2", firstName: "Ananya", lastName: "Sharma", age: 24 },
    { id: "3", firstName: "Rohan", lastName: "Deshmukh", age: 31 },
  ];

  const columns: ColumnConfig<User>[] = [
    {
      id: "firstName",
      label: "First Name",
      sortable: true,
      headerComponent: FirstNameHeader,
    },
    { id: "lastName", label: "Last Name", sortable: true },
    {
      id: "age",
      label: "Age",
      sortable: true,
      headerClass: "text-right",
      cellClass: "text-right",
      cellComponent: AgeCell,
    },
  ];

  return (
    <div>
      <input
        type="text"
        placeholder="Search users..."
        bind:value={searchQuery}
        class="mb-4 rounded border px-3 py-2"
      />

      <QwikTable
        rowData={users}
        columnConfig={columns}
        rowKey={["id"]}
        searchQuery={searchQuery}
        classNames={{
          container: "overflow-x-auto rounded-lg border border-gray-200",
          table: "w-full text-left text-sm",
          thead: "bg-gray-100 uppercase text-gray-700",
          th: "px-4 py-3 font-semibold",
          tr: "border-b hover:bg-gray-50",
          td: "px-4 py-3",
          emptyCell: "py-8 text-center text-gray-500",
        }}
      />
    </div>
  );
});
```

---

## Headless Pagination

Pass reactive `Signal<number>` values to `currentPage` and `pageSize`, along with your own `paginationComponent` to render any pagination UI:

```tsx
import { component$, useSignal, type QRL } from "@builder.io/qwik";
import { QwikTable, type PaginationState } from "qwik-table-core";

const MyPagination = component$<
  PaginationState & {
    onPageChange$: QRL<(page: number) => void>;
    onPageSizeChange$: QRL<(size: number) => void>;
  }
>((props) => (
  <div class="mt-4 flex items-center justify-between">
    <select
      value={props.pageSize}
      onChange$={(_e, el) => props.onPageSizeChange$(Number(el.value))}
    >
      {[10, 25, 50, 100].map((size) => (
        <option key={size} value={size} selected={props.pageSize === size}>
          {String(size)}
        </option>
      ))}
    </select>

    <div class="flex items-center gap-2">
      <button
        type="button"
        disabled={props.currentPage <= 1}
        onClick$={() => props.onPageChange$(props.currentPage - 1)}
      >
        Prev
      </button>
      <span>
        Page {props.currentPage} of {props.totalPages} ({props.totalRows} rows)
      </span>
      <button
        type="button"
        disabled={props.currentPage >= props.totalPages}
        onClick$={() => props.onPageChange$(props.currentPage + 1)}
      >
        Next
      </button>
    </div>
  </div>
));

export default component$(() => {
  const currentPage = useSignal(1);
  const pageSize = useSignal(25);

  return (
    <QwikTable
      rowData={users}
      columnConfig={columns}
      rowKey={["id"]}
      currentPage={currentPage}
      pageSize={pageSize}
      paginationComponent={MyPagination}
    />
  );
});
```

---

## Typed `meta` Action Forwarding

Use the generic `meta` prop (`QwikTable<T, TMeta>`) to pass `QRL` action handlers or shared configuration directly to custom cells without Context boilerplate or closure serialization overhead:

```tsx
import { $, component$, useStore, type QRL } from "@builder.io/qwik";
import { QwikTable, type ColumnConfig } from "qwik-table-core";

interface User {
  id: string;
  firstName: string;
}

interface TableMeta {
  onDelete$: QRL<(user: User) => void>;
}

const DeleteCell = component$<{ row: User; meta?: TableMeta }>((props) => (
  <button type="button" onClick$={() => props.meta?.onDelete$(props.row)}>
    Delete {props.row.firstName}
  </button>
));

export default component$(() => {
  const users = useStore<User[]>([
    { id: "1", firstName: "Aarav" },
    { id: "2", firstName: "Ananya" },
  ]);

  const handleDelete$ = $((target: User) => {
    const idx = users.findIndex((u) => u.id === target.id);
    if (idx !== -1) users.splice(idx, 1);
  });

  const columns: ColumnConfig<User, TableMeta>[] = [
    { id: "firstName", label: "First Name" },
    { id: "delete", label: "Actions", cellComponent: DeleteCell },
  ];

  return (
    <QwikTable<User, TableMeta>
      rowData={users}
      columnConfig={columns}
      rowKey={["id"]}
      meta={{ onDelete$: handleDelete$ }}
    />
  );
});
```

---

## Preserving Editable Cell State Across Filters & Pages

When rows are filtered out by `searchQuery` or sliced by pagination, unmounted `<tr>` elements are removed from the DOM. To persist user inputs or counters across filter, sort, and page changes, store your rows in Qwik's `useStore` (or a keyed `useStore` map) and mutate row properties directly:

```tsx
import { component$, useStore } from "@builder.io/qwik";

interface User {
  id: string;
  firstName: string;
  note?: string;
}

export default component$(() => {
  const users = useStore<User[]>([{ id: "1", firstName: "Aarav" }]);

  const NoteCell = component$<{ row: User }>((props) => (
    <input
      type="text"
      value={props.row.note ?? ""}
      onInput$={(_e, el) => {
        props.row.note = el.value;
      }}
    />
  ));

  // Pass `users` to `rowData` and `NoteCell` inside `columnConfig`
});
```

---

## Server-Side Sorting & Pagination

```tsx
import { $ } from "@builder.io/qwik";
import { QwikTable } from "qwik-table-core";

<QwikTable
  rowData={serverRows}
  columnConfig={columns}
  rowKey={["id"]}
  manualSort={true}
  onSort$={$((sortState) => {
    console.log("Fetch sorted page:", sortState.columnId, sortState.direction);
  })}
  manualPagination={true}
  totalRows={serverTotalCount}
  currentPage={currentPage}
  pageSize={pageSize}
  onPageChange$={$((page) => {
    console.log("Fetch page:", page);
  })}
  paginationComponent={MyPagination}
/>;
```

---

## API Reference

### `<QwikTable<T, TMeta> />` Props

| Prop                  | Type                                                                       | Required | Default | Description                                                                                                              |
| :-------------------- | :------------------------------------------------------------------------- | :------: | :-----: | :----------------------------------------------------------------------------------------------------------------------- |
| `rowData`             | `T[] \| Signal<T[]>`                                                       |   Yes    |    —    | Array of row objects (or a reactive `Signal<T[]>`) to display.                                                           |
| `columnConfig`        | `ColumnConfig<T, TMeta>[]`                                                 |   Yes    |    —    | Array of column configuration objects.                                                                                   |
| `rowKey`              | `(keyof T)[]`                                                              |   Yes    |    —    | Property keys used to build a unique composite DOM key for each `<tr>`.                                                  |
| `searchQuery`         | `string \| Signal<string>`                                                 |    No    |  `""`   | Case-insensitive search filter matched across configured columns.                                                        |
| `meta`                | `TMeta`                                                                    |    No    |    —    | Custom metadata or `QRL` action handlers forwarded to header, cell, and pagination components.                           |
| `pageSize`            | `Signal<number>`                                                           |    No    |    —    | Reactive `Signal<number>` controlling rows per page. When omitted or `<= 0`, all matching rows render.                   |
| `currentPage`         | `Signal<number>`                                                           |    No    |   `1`   | Reactive 1-indexed `Signal<number>` tracking the active page.                                                            |
| `manualPagination`    | `boolean`                                                                  |    No    | `false` | Disables internal client-side array slicing for backend-paginated APIs.                                                  |
| `totalRows`           | `number \| Signal<number>`                                                 |    No    |    —    | Total record count on the backend when `manualPagination` is `true`.                                                     |
| `onPageChange$`       | `QRL<(page: number) => void>`                                              |    No    |    —    | QRL callback invoked whenever the page changes via `paginationComponent`.                                                |
| `paginationComponent` | `Component<PaginationState & { onPageChange$, onPageSizeChange$, meta? }>` |    No    |    —    | Custom headless Qwik `component$` rendered below `</table>` inside `container`.                                          |
| `emptyComponent`      | `Component<object>`                                                        |    No    |    —    | Custom Qwik `component$` rendered when zero records match.                                                               |
| `onSort$`             | `QRL<(state: SortState) => void>`                                          |    No    |    —    | QRL callback triggered whenever a sortable header is clicked or activated via keyboard.                                  |
| `manualSort`          | `boolean`                                                                  |    No    | `false` | Disables internal client-side sorting when sorting on a backend.                                                         |
| `classNames`          | `TableClassNames`                                                          |    No    |    —    | Slot-based CSS classes (`container`, `table`, `thead`, `headerRow`, `th`, `tbody`, `tr`, `td`, `emptyRow`, `emptyCell`). |

### `ColumnConfig<T, TMeta>`

| Property          | Type                                          | Required | Description                                                                                      |
| :---------------- | :-------------------------------------------- | :------: | :----------------------------------------------------------------------------------------------- |
| `id`              | `keyof T \| string`                           |   Yes    | Key matching a property on `T` or a custom ID for virtual columns.                               |
| `label`           | `string`                                      |   Yes    | Display text rendered inside `<th>` when `headerComponent` is omitted.                           |
| `sortable`        | `boolean`                                     |    No    | Enables click and keyboard (`Enter`/`Space`) sorting (`asc` → `desc` → `null`) with `aria-sort`. |
| `headerClass`     | `string`                                      |    No    | Extra CSS class appended to this column's `<th>`.                                                |
| `cellClass`       | `string`                                      |    No    | Extra CSS class appended to this column's `<td>`.                                                |
| `headerComponent` | `Component<{ column, sortDirection, meta? }>` |    No    | Custom Qwik `component$` rendered inside `<th>`.                                                 |
| `cellComponent`   | `Component<{ value, row, meta? }>`            |    No    | Custom Qwik `component$` rendered inside `<td>`.                                                 |

### `PaginationState`

| Property      | Type     | Description                                                               |
| :------------ | :------- | :------------------------------------------------------------------------ |
| `currentPage` | `number` | Current 1-indexed active page number (clamped safely to `1..totalPages`). |
| `pageSize`    | `number` | Active number of rows per page.                                           |
| `totalRows`   | `number` | Total matching row count (or server-reported `totalRows`).                |
| `totalPages`  | `number` | Total available pages (`>= 1`).                                           |

---

## License

MIT © Omkar Hankare
