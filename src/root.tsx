import { $, component$, useSignal } from "@builder.io/qwik";
import { QwikTable, type ColumnConfig, type SortState } from "./index";
import { MOCK_USERS } from "./sandbox/contants";
import { GreetButton } from "./sandbox/GreetBtn";
import "./sandbox/sandbox.css";
import { User } from "./sandbox/types";

export default component$(() => {
  const lastSortEvent = useSignal("None yet");

  const columns: ColumnConfig<User>[] = [
    {
      id: "firstName",
      label: "First Name",
      sortable: true,
      // Test custom headerRender$ with sort direction
      headerRender$: $((col, dir) => (
        <span>
          {col.label} {dir === "asc" ? "↑" : dir === "desc" ? "↓" : "↕"}
        </span>
      )),
    },
    { id: "lastName", label: "Last Name", sortable: true },
    {
      id: "age",
      label: "Age",
      sortable: true,
      headerClass: "age-header",
      cellClass: "age-cell",
      render$: $((val) => <strong>{String(val)} yrs</strong>),
    },
    {
      id: "actions",
      label: "Actions",
      render$: $((_val, row) => <GreetButton name={row.firstName} />),
    },
  ];

  const handleSort$ = $((state: SortState) => {
    lastSortEvent.value = `${state.columnId ?? "reset"} (${state.direction ?? "none"})`;
  });

  return (
    <>
      <head>
        <meta charset="utf-8" />
        <title>qwik-table-core Sandbox</title>
      </head>
      <body style={{ padding: "2rem", fontFamily: "sans-serif" }}>
        <p>
          <strong>Last onSort$:</strong> {lastSortEvent.value}
        </p>

        <QwikTable
          rowData={MOCK_USERS}
          columnConfig={columns}
          rowKey={["age", "firstName"]}
          onSort$={handleSort$}
          classNames={{
            table: "demo-table",
            th: "demo-th",
            td: "demo-td",
          }}
        />
      </body>
    </>
  );
});
