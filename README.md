# QwikTable

A headless, unstyled data table component built natively for Qwik.

`QwikTable` renders semantic HTML `<table>` markup without bundled CSS, letting you style it with your own stylesheets or utility classes. It supports single-column sorting, custom QRL cell rendering, and server-side sorting hooks while adhering to Qwik's lazy-loading boundaries.

---

## Features

- **Unstyled Semantic Markup:** Outputs standard `<table>`, `<thead>`, `<tbody>`, `<tr>`, `<th>`, and `<td>` elements.
- **Lazy-Loaded Interactions:** Event handlers and custom cell renderers use Qwik QRLs (`$`), loading only when needed.
- **Client-Side Sorting:** Built-in single-column sorting (`asc` → `desc` → `null`).
- **Custom Cell Renderers (`render$`):** Render custom JSX elements inside cells using serializable QRL functions.
- **Server-Side Sorting Support (`onSort$` & `manualSort`):** Disable local sorting and handle sort state updates externally.
- **TypeScript Support:** Infers row data types across column configurations and cell renderers.

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

## Basic Usage

Pass an array of plain objects to `rowData` and define your columns in `columnConfig`.

```tsx
import { component,  } from "@builder.io/qwik";
import { QwikTable } from "qwik-table-core";

interface User {
  firstName: string;
  lastName: string;
  age: number;
}

export default component\$(() => {
  const users: User[] = [
    { firstName: "Aarav", lastName: "Joshi", age: 28 },
    { firstName: "Ananya", lastName: "Sharma", age: 24 },
    { firstName: "Rohan", lastName: "Deshmukh", age: 31 },
  ];

  return (
    <QwikTable
      rowData={users}
      columnConfig={[
        { id: "firstName", label: "First Name", sortable: true },
        { id: "lastName", label: "Last Name", sortable: true },
        {
          id: "age",
          label: "Age",
          sortable: true,
          render: ((val) => <strong>{String(val)} yrs</strong>),
        },
      ]}
    />
  );
});
```

---

## Advanced Usage

### Extracted Column Definitions

If you define your columns outside of the JSX prop, import `ColumnConfig<T>` to keep TypeScript inference for `id` and `row`:

```tsx
import { component,  } from "@builder.io/qwik";
import { QwikTable, type ColumnConfig } from "qwik-table-core";

interface User {
  id: number;
  name: string;
  role: string;
}

export default component\$(() => {
  const columns: ColumnConfig<User>[] = [
    { id: "name", label: "Name", sortable: true },
    { id: "role", label: "Role" },
    {
      id: "actions",
      label: "Actions",
      render: ((_val, row) => (
        <button onClick\$={() => alert(`Editing ${row.name}`)}>Edit</button>
      )),
    },
  ];

  const users: User[] = [
    { id: 1, name: "Priya Patil", role: "Admin" },
    { id: 2, name: "Kabir Mehta", role: "Developer" },
  ];

  return <QwikTable rowData={users} columnConfig={columns} />;
});
```

### Server-Side Sorting

To handle sorting via an API or server loader instead of sorting `rowData` in memory, set `manualSort={true}` and listen to `onSort$`:

```tsx
import { component, , useSignal } from "@builder.io/qwik";
import { QwikTable, type SortState } from "qwik-table-core";

export default component\$(() => {
  const serverData = useSignal([
    { firstName: "Aditya", lastName: "Kulkarni", age: 29 },
  ]);

  const handleServerSort = ((sortState: SortState) => {
    console.log("Fetch sorted data:", sortState.columnId, sortState.direction);
  });

  return (
    <QwikTable
      rowData={serverData.value}
      columnConfig={[
        { id: "firstName", label: "First Name", sortable: true },
        { id: "age", label: "Age", sortable: true },
      ]}
      manualSort={true}
      onSort=handleServerSort}
    />
  );
});
```

---

## API Reference

### `<QwikTable />` Props

| Prop           | Type                              | Default      | Description                                                        |
| :------------- | :-------------------------------- | :----------- | :----------------------------------------------------------------- |
| `rowData`      | `T[]`                             | **Required** | Array of plain objects representing table rows.                    |
| `columnConfig` | `ColumnConfig<T>[]`               | **Required** | Configuration array defining columns, headers, and cell templates. |
| `onSort$`      | `QRL<(state: SortState) => void>` | `undefined`  | Optional callback fired whenever a sortable header is clicked.     |
| `manualSort`   | `boolean`                         | `false`      | Disables internal client-side sorting when `true`.                 |

### `ColumnConfig<T>` Properties

| Property   | Type                                       | Default      | Description                                                                  |
| :--------- | :----------------------------------------- | :----------- | :--------------------------------------------------------------------------- |
| `id`       | `keyof T \| string`                        | **Required** | Property key on the row object, or a unique string for virtual columns.      |
| `label`    | `string`                                   | **Required** | Text rendered inside the `<th>` header cell.                                 |
| `sortable` | `boolean`                                  | `false`      | Enables click-to-sort cycling on the column header.                          |
| `render$`  | `QRL<(val: unknown, row: T) => JSXOutput>` | `undefined`  | Custom QRL function to render JSX inside the cell. Must be wrapped in `$()`. |

### `SortState`

| Property    | Type                      | Description                                                     |
| :---------- | :------------------------ | :-------------------------------------------------------------- |
| `columnId`  | `string \| null`          | The `id` of the currently sorted column, or `null` if unsorted. |
| `direction` | `"asc" \| "desc" \| null` | Current sort direction, or `null` if unsorted.                  |

---

## Notes on Qwik Serialization

Any function passed to `render$` or `onSort$` must be wrapped in `$()` so Qwik can serialize and lazy-load it across component boundaries.

## License

MIT
