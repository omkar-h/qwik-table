import { component$, type QRL } from "@builder.io/qwik";
import { PaginationState } from "../components/qwikTable/types";

export interface TablePaginationProps extends PaginationState {
  onPageChange$: QRL<(page: number) => void>;
  onPageSizeChange$: QRL<(size: number) => void>;
}

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100, 500];

/** Builds a compact page sequence like [1, "...", 4, 5, 6, "...", 100] */
const buildPageRange = (
  current: number,
  total: number,
): (number | "ellipsis")[] => {
  if (total <= 7) {
    return Array.from({ length: total }, (_, idx) => idx + 1);
  }
  if (current <= 4) {
    return [1, 2, 3, 4, 5, "ellipsis", total];
  }
  if (current >= total - 3) {
    return [1, "ellipsis", total - 4, total - 3, total - 2, total - 1, total];
  }
  return [1, "ellipsis", current - 1, current, current + 1, "ellipsis", total];
};

export const TablePagination = component$<TablePaginationProps>((props) => {
  const {
    currentPage,
    pageSize,
    totalRows,
    totalPages,
    onPageChange$,
    onPageSizeChange$,
  } = props;

  const startRow = totalRows === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endRow = Math.min(currentPage * pageSize, totalRows);
  const pages = buildPageRange(currentPage, totalPages);

  return (
    <nav
      aria-label="Table pagination"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "12px",
        padding: "12px 4px",
        fontSize: "14px",
      }}
    >
      {/* Left: Item Range Summary + Page Size Dropdown */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <span style={{ color: "#4b5563" }}>
          Showing <strong>{startRow}</strong>–<strong>{endRow}</strong> of{" "}
          <strong>{totalRows}</strong>
        </span>

        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            color: "#4b5563",
          }}
        >
          <span>Rows:</span>
          <select
            aria-label="Rows per page"
            value={pageSize}
            onChange$={(_event, el) => onPageSizeChange$(Number(el.value))}
            style={{
              padding: "4px 8px",
              borderRadius: "6px",
              border: "1px solid #d1d5db",
              backgroundColor: "#ffffff",
              color: "#111827",
              cursor: "pointer",
            }}
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size} selected={pageSize === size}>
                {String(size)}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Right: Numbered Page Navigation Buttons */}
      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
        <button
          type="button"
          aria-label="First page"
          disabled={currentPage <= 1}
          onClick$={() => onPageChange$(1)}
          style={navBtnStyle(currentPage <= 1)}
        >
          «
        </button>

        <button
          type="button"
          aria-label="Previous page"
          disabled={currentPage <= 1}
          onClick$={() => onPageChange$(currentPage - 1)}
          style={navBtnStyle(currentPage <= 1)}
        >
          Prev
        </button>

        {pages.map((item, idx) =>
          item === "ellipsis" ? (
            <span
              key={`ellipsis-${idx}`}
              style={{ padding: "0 6px", color: "#6b7280" }}
            >
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              aria-current={item === currentPage ? "page" : undefined}
              onClick$={() => onPageChange$(item)}
              style={{
                padding: "6px 11px",
                borderRadius: "6px",
                border: "1px solid",
                borderColor: item === currentPage ? "#111827" : "#d1d5db",
                backgroundColor: item === currentPage ? "#111827" : "#ffffff",
                color: item === currentPage ? "#ffffff" : "#111827",
                fontWeight: item === currentPage ? "600" : "400",
                cursor: "pointer",
              }}
            >
              {String(item)}
            </button>
          ),
        )}

        <button
          type="button"
          aria-label="Next page"
          disabled={currentPage >= totalPages}
          onClick$={() => onPageChange$(currentPage + 1)}
          style={navBtnStyle(currentPage >= totalPages)}
        >
          Next
        </button>

        <button
          type="button"
          aria-label="Last page"
          disabled={currentPage >= totalPages}
          onClick$={() => onPageChange$(totalPages)}
          style={navBtnStyle(currentPage >= totalPages)}
        >
          »
        </button>
      </div>
    </nav>
  );
});

const navBtnStyle = (disabled: boolean) => ({
  padding: "6px 10px",
  borderRadius: "6px",
  border: "1px solid #d1d5db",
  backgroundColor: disabled ? "#f3f4f6" : "#ffffff",
  color: disabled ? "#9ca3af" : "#111827",
  cursor: disabled ? "not-allowed" : "pointer",
});
