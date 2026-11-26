# Changelog

All notable changes to `qwik-table-core` are documented in this file.

## - 2026-11-26

### Added

- **Headless Row Selection (`multiple` & `single` modes):** Added `rowSelection` (`Signal<Record<string, boolean>>`), `selectionMode`, and `onRowSelectionChange$` with atomic O(1) batch toggles and an O(1) `{}` clear fast-path.
- **Selection Slot Forwarding & Styling:** Forwarded `rowId`, `isSelected`, and shared `toggleRow$` (`QRL<(rowId: string) => void>`) to `cellComponent`; forwarded `isAllPageSelected`, `isSomePageSelected`, `toggleVisibleRows$`, `isAllRowsSelected`, and `toggleAllRows$` to `headerComponent`; added `data-selected="true"` and `classNames.selectedTr` to `<tr>`.
- **Smart Column Search Defaults:** Added `searchable?: boolean` on `ColumnConfig` (defaults to `true` for plain text columns and `false` for custom `cellComponent` columns).

### Changed

- **Leaf-Isolated Cell Reactivity:** Removed eager `row[col.id]` reads in `tbody` for custom `cellComponent` columns (`cellComponent` now receives `{ row, column, rowId, isSelected, toggleRow$, meta }`), eliminating full-table re-renders during high-frequency cell edits.
- **Modular Core Architecture:** Extracted `computeTablePipeline` (`pipeline.ts`) and selection helpers (`selection.ts`) out of `qwikTable.tsx`.

---

## - 2026-11-26

### Added

- **Headless Pagination (`Filter → Sort → Paginate`):** Added `currentPage` (`Signal<number>`), `pageSize` (`Signal<number>`), `manualPagination`, `totalRows`, `onPageChange$`, and `paginationComponent` slot with automatic out-of-bounds page clamping.
- **Typed `meta` Forwarding (`QwikTable<T, TMeta>`):** Forward custom metadata and `QRL` action handlers (`onDelete$`, `onEdit$`) directly to `headerComponent`, `cellComponent`, and `paginationComponent`.
- **ARIA & Keyboard Sorting:** Added `aria-sort="ascending" | "descending" | "none"` and `tabIndex={0}` with `Enter`/`Space` keyboard sorting on sortable `<th>` headers.

---

## - 2026-11-25

### Added

- **Fine-Grained `Signal` Search & Store Reactivity:** Supported `Signal<T[]>` for `rowData` and `Signal<string>` for `searchQuery`, with O(1) `useStore` array mutation tracking.
- **Server-Side Sorting:** Added `manualSort` and `onSort$` QRL callback.
- **Empty State Slot:** Added `emptyComponent` prop and `emptyRow` / `emptyCell` class slots.

---

## - 2026-11-24

### Added

- Initial release of `qwik-table-core` with headless semantic `<table>` rendering, composite `rowKey`, lazy-loaded click sorting (`asc` → `desc` → `null`), custom `headerComponent` / `cellComponent` slots, and slot-based `classNames`.
