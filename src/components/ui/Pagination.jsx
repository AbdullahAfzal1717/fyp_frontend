import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Compact page control: 1 … 4 5 6 … 30
 * Avoids rendering every page button when totals are large.
 */
export function getPageWindow(current, total, sibling = 1) {
  if (total <= 1) return [1];
  const pages = new Set([1, total, current]);
  for (let i = 1; i <= sibling; i += 1) {
    if (current - i > 1) pages.add(current - i);
    if (current + i < total) pages.add(current + i);
  }
  const sorted = [...pages].sort((a, b) => a - b);
  const withGaps = [];
  for (let i = 0; i < sorted.length; i += 1) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) withGaps.push("…");
    withGaps.push(sorted[i]);
  }
  return withGaps;
}

export default function Pagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  className = "",
}) {
  if (totalPages <= 1) return null;

  const safePage = Math.min(Math.max(1, page), totalPages);
  const window = getPageWindow(safePage, totalPages, 1);
  const from = (safePage - 1) * pageSize + 1;
  const to = Math.min(safePage * pageSize, totalItems);

  return (
    <div
      className={`p-4 border-t border-gray-50 flex flex-col sm:flex-row items-center justify-between gap-3 ${className}`}
    >
      <p className="text-xs text-gray-400 order-2 sm:order-1">
        Showing {from}–{to} of {totalItems}
      </p>
      <div className="flex items-center gap-1.5 order-1 sm:order-2">
        <button
          type="button"
          aria-label="Previous page"
          disabled={safePage === 1}
          onClick={() => onPageChange(safePage - 1)}
          className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-30 hover:bg-gray-50"
        >
          <ChevronLeft size={16} />
        </button>

        {window.map((item, idx) =>
          item === "…" ? (
            <span
              key={`gap-${idx}`}
              className="w-8 h-8 flex items-center justify-center text-xs text-gray-300 font-bold"
            >
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange(item)}
              className={`min-w-8 h-8 px-2 rounded-lg text-xs font-bold transition-all ${
                safePage === item
                  ? "bg-blue-600 text-white shadow-sm"
                  : "border border-gray-200 text-gray-500 hover:bg-gray-50"
              }`}
            >
              {item}
            </button>
          ),
        )}

        <button
          type="button"
          aria-label="Next page"
          disabled={safePage === totalPages}
          onClick={() => onPageChange(safePage + 1)}
          className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-30 hover:bg-gray-50"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
