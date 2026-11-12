import { component$, $, useSignal } from "@builder.io/qwik";
import {
  QwikTable,
  SortDirection,
  type ColumnConfig,
  type SortState,
} from "../index";
import { MOCK_USERS } from "./contants";
import type { User } from "./types";
import { GreetButton } from "./GreetBtn";

export const TableSandbox = component$(() => {
  const searchQuery = useSignal("");
  const lastSortEvent = useSignal("None yet");

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

  const ActionCell = component$<{ row: User }>((props) => (
    <GreetButton name={props.row.firstName} />
  ));

  const NoResults = component$(() => <em>No matching users found.</em>);

  // Inside columns:
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
        rowData={MOCK_USERS}
        columnConfig={columns}
        rowKey={["lastName", "firstName"]}
        searchQuery={searchQuery}
        onSort$={handleSort$}
        emptyComponent={NoResults}
        classNames={{
          table: "demo-table",
          th: "demo-th",
          td: "demo-td",
          emptyCell: "demo-empty-cell",
        }}
      />
    </div>
  );
});
