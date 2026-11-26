import { $, component$, type QRL, type Signal } from "@builder.io/qwik";
import type { User } from "./types";

export interface SelectionToolbarProps {
  users: User[];
  rowSelection: Signal<Record<string, boolean>>;
  onBulkDelete$: QRL<() => void>;
}

export const SelectionToolbar = component$<SelectionToolbarProps>((props) => {
  const selectionMap = props.rowSelection.value;
  const totalUsers = props.users.length;
  const selectedCount = Object.keys(selectionMap).filter((k) =>
    Boolean(selectionMap[k]),
  ).length;

  const areAllSelected =
    totalUsers > 0 &&
    props.users.every((u) =>
      Boolean(selectionMap[`${u.lastName}-${u.firstName}`]),
    );

  const handleToggleAll$ = $(() => {
    const currentlyAllSelected =
      props.users.length > 0 &&
      props.users.every((u) =>
        Boolean(props.rowSelection.value[`${u.lastName}-${u.firstName}`]),
      );

    if (currentlyAllSelected) {
      props.rowSelection.value = {};
      return;
    }

    const next: Record<string, boolean> = {};
    for (let i = 0; i < props.users.length; i++) {
      const u = props.users[i];
      next[`${u.lastName}-${u.firstName}`] = true;
    }
    props.rowSelection.value = next;
  });

  const handleClear$ = $(() => {
    props.rowSelection.value = {};
  });

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
        padding: "10px 14px",
        marginBottom: "12px",
        backgroundColor: selectedCount > 0 ? "#eff6ff" : "#f8fafc",
        border: `1px solid ${selectedCount > 0 ? "#bfdbfe" : "#e2e8f0"}`,
        borderRadius: "8px",
        fontSize: "14px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <span>
          <strong>{selectedCount}</strong> of <strong>{totalUsers}</strong> rows
          selected
        </span>

        {totalUsers > 0 && (
          <button
            type="button"
            onClick$={handleToggleAll$}
            style={{
              padding: "4px 10px",
              backgroundColor: "#ffffff",
              color: "#1d4ed8",
              border: "1px solid #93c5fd",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            {areAllSelected
              ? `Deselect All (${totalUsers})`
              : `Select All ${totalUsers} Rows`}
          </button>
        )}

        {selectedCount > 0 && !areAllSelected && (
          <button
            type="button"
            onClick$={handleClear$}
            style={{
              padding: "4px 10px",
              backgroundColor: "transparent",
              color: "#475569",
              border: "1px solid #cbd5e1",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Clear
          </button>
        )}
      </div>

      {selectedCount > 0 && (
        <button
          type="button"
          onClick$={() => props.onBulkDelete$()}
          style={{
            padding: "6px 14px",
            backgroundColor: "#dc2626",
            color: "#ffffff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          Delete Selected ({selectedCount})
        </button>
      )}
    </div>
  );
});
