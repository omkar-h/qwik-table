# qwik-table-core

A **headless, zero-hydration data table component** built natively for [Qwik](https://qwik.dev).

`qwik-table-core` leverages Qwik's resumable architecture, `Signal` forwarding, and lazy-loaded QRLs (`$`) so your tables render cleanly on the server and execute zero client-side JavaScript until the user interacts with them.

## Features

- **Zero Hydration Overhead:** Ships pure HTML `<table>` markup with zero hardcoded styles, wrappers, or icons.
- **Fine-Grained `Signal` Search:** Pass a reactive `Signal<string>` to `searchQuery` to filter rows across columns without re-rendering parent components.
- **Lazy-Loaded Sorting:** Click-to-sort cycling (`asc` → `desc` → `null`) downloads sorting logic on first interaction, with `manualSort` support for server-side sorting.
- **Composite Row Keys (`rowKey`):** Preserves component state and input focus across sort operations via stable composite DOM keys.
- **Custom Qwik Component Slots:** Render custom `component$` definitions for headers (`headerComponent`), cells (`cellComponent`), and empty states (`emptyComponent`).
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

## Preserving Editable Cell State Across Filters

When rows are filtered out by `searchQuery`, non-matching `<tr>` elements are unmounted from the DOM. To persist user inputs or counters inside custom cells across filter changes, store edits in a Qwik `useStore` keyed by your unique row key:

```tsx
import { component$, useStore } from "@builder.io/qwik";

interface User {
  id: string;
  firstName: string;
}

export default component$(() => {
  const rowEdits = useStore<Record<string, { note?: string }>>({});

  const NoteCell = component$<{ row: User }>((props) => (
    <input
      type="text"
      value={rowEdits[props.row.id]?.note ?? ""}
      onInput$={(_e, el) => {
        rowEdits[props.row.id] = { note: el.value };
      }}
    />
  ));

  // Pass NoteCell inside your columnConfig's cellComponent property
});
```

---

## Server-Side Sorting (`manualSort` + `onSort$`)

```tsx
import { $ } from "@builder.io/qwik";
import { QwikTable } from "qwik-table-core";

<QwikTable
  rowData={serverRows}
  columnConfig={columns}
  rowKey={["id"]}
  manualSort={true}
  onSort=((sortState) => {
    console.log("Fetch sorted page:", sortState.columnId, sortState.direction);
  })}
/>
```

---

## API Reference

### `<QwikTable />` Props

| Prop             | Type                              | Required | Default | Description                                                                                                              |
| :--------------- | :-------------------------------- | :------: | :-----: | :----------------------------------------------------------------------------------------------------------------------- |
| `rowData`        | `T[] \| Signal<T[]>`              |   Yes    |    —    | Array of row objects (or a reactive `Signal`) to display.                                                                |
| `columnConfig`   | `ColumnConfig<T>[]`               |   Yes    |    —    | Array of column configuration objects.                                                                                   |
| `rowKey`         | `(keyof T)[]`                     |   Yes    |    —    | Property keys used to build a unique composite DOM key for each `<tr>`.                                                  |
| `searchQuery`    | `string \| Signal<string>`        |    No    |  `""`   | Case-insensitive search filter matched across configured columns.                                                        |
| `emptyComponent` | `Component<{}>`                   |    No    |    —    | Custom Qwik `component$` rendered when zero records match.                                                               |
| `onSort$`        | `QRL<(state: SortState) => void>` |    No    |    —    | QRL callback triggered whenever a sortable header is clicked.                                                            |
| `manualSort`     | `boolean`                         |    No    | `false` | Disables internal client-side sorting when sorting on a backend.                                                         |
| `classNames`     | `TableClassNames`                 |    No    |    —    | Slot-based CSS classes (`container`, `table`, `thead`, `headerRow`, `th`, `tbody`, `tr`, `td`, `emptyRow`, `emptyCell`). |

### `ColumnConfig<T>`

| Property          | Type                                   | Required | Description                                                            |
| :---------------- | :------------------------------------- | :------: | :--------------------------------------------------------------------- |
| `id`              | `keyof T \| string`                    |   Yes    | Key matching a property on `T` or a custom ID for virtual columns.     |
| `label`           | `string`                               |   Yes    | Display text rendered inside `<th>` when `headerComponent` is omitted. |
| `sortable`        | `boolean`                              |    No    | Enables click-to-sort cycling (`asc` → `desc` → `null`).               |
| `headerClass`     | `string`                               |    No    | Extra CSS class appended to this column's `<th>`.                      |
| `cellClass`       | `string`                               |    No    | Extra CSS class appended to this column's `<td>`.                      |
| `headerComponent` | `Component<{ column, sortDirection }>` |    No    | Custom Qwik `component$` rendered inside `<th>`.                       |
| `cellComponent`   | `Component<{ value, row }>`            |    No    | Custom Qwik `component$` rendered inside `<td>`.                       |

---

## License

MIT © Omkar Hankare
