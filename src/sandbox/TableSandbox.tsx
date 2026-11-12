import { $, component$, useSignal, useStore } from "@builder.io/qwik";
import {
  QwikTable,
  type ColumnConfig,
  type SortDirection,
  type SortState,
} from "../index";
import { MOCK_USERS } from "./contants";
import { GreetButton } from "./GreetButton";
import type { User } from "./types";

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

const AgeCell = component$<{ value: unknown }>((props) => (
  <span>{String(props.value)} yrs</span>
));

// Editable cell reading and writing directly to the reactive `props.row` proxy!
const NoteCell = component$<{ row: User }>((props) => (
  <input
    type="text"
    placeholder="Add note..."
    value={props.row.note ?? ""}
    onInput$={(_event, el) => {
      props.row.note = el.value;
    }}
  />
));

const ActionCell = component$<{ row: User }>((props) => (
  <GreetButton user={props.row} />
));

export const TableSandbox = component$(() => {
  const users = useStore<User[]>(structuredClone(MOCK_USERS));
  const searchQuery = useSignal("");
  const lastSortEvent = useSignal("None yet");

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
      headerClass: "age-header",
      cellClass: "age-cell",
      cellComponent: AgeCell,
    },
    {
      id: "note",
      label: "Notes (Persistent)",
      cellComponent: NoteCell,
    },
    {
      id: "actions",
      label: "Actions",
      cellComponent: ActionCell,
    },
  ];

  const handleSort$ = $((state: SortState) => {
    lastSortEvent.value = `${state.columnId ?? "reset"} (${state.direction ?? "none"})`;
  });

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <p>
        <strong>Last onSort$:</strong> {lastSortEvent.value}
      </p>

      <input
        type="text"
        placeholder="Search users..."
        bind:value={searchQuery}
        style={{ padding: "8px 12px", marginBottom: "12px", width: "260px" }}
      />

      <QwikTable
        rowData={users}
        columnConfig={columns}
        rowKey={["lastName", "firstName"]}
        searchQuery={searchQuery}
        onSort$={handleSort$}
        classNames={{
          table: "demo-table",
          th: "demo-th",
          td: "demo-td",
        }}
      />
    </div>
  );
});
