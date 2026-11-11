import { component$, $, useSignal } from "@builder.io/qwik";
import { QwikTable } from "./components/qwikTable/qwikTable";
import { ColumnConfig, SortState } from "./components/qwikTable/types";

interface User {
  firstName: string;
  lastName: string;
  age: number;
}

const mockUsers: User[] = [
  { firstName: "Aarav", lastName: "Joshi", age: 28 },
  { firstName: "Ananya", lastName: "Sharma", age: 24 },
  { firstName: "Rohan", lastName: "Deshmukh", age: 31 },
  { firstName: "Priya", lastName: "Patil", age: 27 },
  { firstName: "Kabir", lastName: "Mehta", age: 35 },
  { firstName: "Sanya", lastName: "Verma", age: 22 },
  { firstName: "Aditya", lastName: "Kulkarni", age: 29 },
  { firstName: "Diya", lastName: "Nair", age: 26 },
  { firstName: "Rahul", lastName: "Singh", age: 33 },
  { firstName: "Isha", lastName: "Gupta", age: 30 },
  { firstName: "Vikram", lastName: "Shinde", age: 42 },
  { firstName: "Meera", lastName: "Rao", age: 25 },
  { firstName: "Arjun", lastName: "Chavan", age: 28 },
  { firstName: "Neha", lastName: "Mishra", age: 31 },
  { firstName: "Yash", lastName: "Gawde", age: 23 },
];

export default component$(() => {
  const lastSortEvent = useSignal<string>("None yet");

  const columns: ColumnConfig<User>[] = [
    { id: "firstName", label: "First Name", sortable: true },
    { id: "lastName", label: "Last Name", sortable: true },
    {
      id: "age",
      label: "Age",
      sortable: true,
      render$: $((val) => {
        const age = Number(val);
        return (
          <span
            style={{
              fontWeight: "bold",
              color: age >= 30 ? "#d97706" : "#16a34a",
            }}
          >
            {age} yrs
          </span>
        );
      }),
    },
    {
      id: "actions",
      label: "Actions",
      render$: $((_val, row) => (
        <button
          onClick$={() => alert(`Selected ${row.firstName} ${row.lastName}`)}
        >
          Greet
        </button>
      )),
    },
  ];

  const handleTableSort$ = $((state: SortState) => {
    lastSortEvent.value = `Column: ${state.columnId ?? "reset"} | Direction: ${state.direction ?? "none"}`;
  });

  return (
    <>
      <head>
        <meta charset="utf-8" />
        <title>QwikTable Sandbox</title>
      </head>
      <body style={{ padding: "2rem", fontFamily: "sans-serif" }}>
        <p style={{ background: "#f3f4f6", padding: "0.75rem" }}>
          <strong>Last onSort$ Event:</strong> {lastSortEvent.value}
        </p>

        <QwikTable
          columnConfig={columns}
          rowData={mockUsers}
          onSort$={handleTableSort$}
        />
      </body>
    </>
  );
});
