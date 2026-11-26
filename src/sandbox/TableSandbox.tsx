import {
  $,
  component$,
  useSignal,
  useStore,
  useTask$,
  type QRL,
} from "@builder.io/qwik";
import {
  QwikTable,
  type ColumnConfig,
  type SortDirection,
  type SortState,
} from "../index";
import { MOCK_USERS } from "./contants";
import { GreetButton } from "./GreetButton";
import { TablePagination } from "./Pagination";
import { SelectionToolbar } from "./SelectionToolbar";
import type { User } from "./types";

/** Typed meta object forwarded to all custom header/cell components */
interface SandboxMeta {
  onDelete$: QRL<(user: User) => void>;
}

/** Header checkbox matching `toggleVisibleRows$` in your current `types.ts` */
const SelectAllHeader = component$<{
  isAllPageSelected: boolean;
  isSomePageSelected: boolean;
  toggleVisibleRows$: QRL<() => void>;
  toggleAllRows$: QRL<() => void>;
}>((props) => {
  const checkboxRef = useSignal<HTMLInputElement>();

  useTask$(({ track }) => {
    const indeterminate = track(() => props.isSomePageSelected);
    if (checkboxRef.value) {
      checkboxRef.value.indeterminate = indeterminate;
    }
  });

  return (
    <input
      ref={checkboxRef}
      type="checkbox"
      aria-label="Select all rows on page"
      checked={props.isAllPageSelected}
      onChange$={() => props.toggleVisibleRows$()}
      style={{ cursor: "pointer", width: "16px", height: "16px" }}
    />
  );
});

/** Per-row selection checkbox */
/** Per-row selection checkbox using 1 shared QRL across all rows */
const SelectCell = component$<{
  row: User;
  rowId: string;
  isSelected: boolean;
  toggleRow$: QRL<(rowId: string) => void>;
}>((props) => (
  <input
    type="checkbox"
    aria-label={`Select ${props.row.firstName} ${props.row.lastName}`}
    checked={props.isSelected}
    preventdefault:click
    onClick$={() => props.toggleRow$(props.rowId)}
    style={{ cursor: "pointer", width: "16px", height: "16px" }}
  />
));

const FirstNameHeader = component$<{
  column: ColumnConfig<User, SandboxMeta>;
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

const AgeCell = component$<{ row: User }>((props) => (
  <span>{String(props.row.age)} yrs</span>
));

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

const DeleteCell = component$<{ row: User; meta?: SandboxMeta }>((props) => {
  return (
    <button
      type="button"
      onClick$={() => {
        props.meta?.onDelete$(props.row);
      }}
    >
      Delete {props.row.firstName} {props.row.lastName}
    </button>
  );
});

export const TableSandbox = component$(() => {
  const users = useStore<User[]>(structuredClone(MOCK_USERS));
  const searchQuery = useSignal("");
  const lastSortEvent = useSignal("None yet");
  const currentPage = useSignal(1);
  const pageSize = useSignal(100);
  const rowSelection = useSignal<Record<string, boolean>>({});

  const columns: ColumnConfig<User, SandboxMeta>[] = [
    {
      id: "select",
      label: "Select",
      headerComponent: SelectAllHeader,
      cellComponent: SelectCell,
    },
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
    {
      id: "delete",
      label: "Delete",
      cellComponent: DeleteCell,
    },
  ];

  const handleSort$ = $((state: SortState) => {
    lastSortEvent.value = `${state.columnId ?? "reset"} (${state.direction ?? "none"})`;
  });

  const handleDelete$ = $((targetUser: User) => {
    const index = users.findIndex(
      (u) =>
        u.firstName === targetUser.firstName &&
        u.lastName === targetUser.lastName,
    );
    if (index !== -1) {
      users.splice(index, 1);
    }
  });

  const handleBulkDelete$ = $(() => {
    const selectedMap = rowSelection.value;
    for (let i = users.length - 1; i >= 0; i--) {
      const key = `${users[i].lastName}-${users[i].firstName}`;
      if (selectedMap[key]) {
        users.splice(i, 1);
      }
    }
    rowSelection.value = {};
  });

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", gap: "1rem" }}>
        <p>
          <strong>Last onSort$:</strong> {lastSortEvent.value}
        </p>

        <SelectionToolbar
          users={users}
          rowSelection={rowSelection}
          onBulkDelete$={handleBulkDelete$}
        />
      </div>

      <QwikTable<User, SandboxMeta>
        rowData={users}
        columnConfig={columns}
        rowKey={["lastName", "firstName"]}
        searchQuery={searchQuery}
        rowSelection={rowSelection}
        onSort$={handleSort$}
        meta={{ onDelete$: handleDelete$ }}
        classNames={{
          table: "demo-table",
          th: "demo-th",
          td: "demo-td",
          container: "demo-container",
          selectedTr: "selected-row",
          tr: "demo-tr",
        }}
        currentPage={currentPage}
        pageSize={pageSize}
        paginationComponent={TablePagination}
      />
    </div>
  );
});
