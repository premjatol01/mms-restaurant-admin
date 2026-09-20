import { ChevronLeft, ChevronRight } from "lucide-react";

// Page numbers to show: first, last, and a window around the current page, with "…" for gaps.
function getPageItems(page, totalPages) {
  const pages = new Set([1, totalPages, page - 1, page, page + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);
  const items = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) items.push(`gap-${p}`);
    items.push(p);
  });
  return items;
}

export default function Pagination({ page, pageSize, total, onPageChange, disabled = false }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (total === 0) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  const navBtn =
    "w-8 h-8 flex items-center justify-center rounded-lg border border-theme text-theme hover:bg-primary-light/20 transition-colors disabled:opacity-40 disabled:pointer-events-none";

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
      <p className="text-sm text-secondary">
        Showing {from}–{to} of {total} {total === 1 ? "review" : "reviews"}
      </p>

      {totalPages > 1 && (
        <nav aria-label="Reviews pagination" className="flex items-center gap-1">
          <button
            type="button"
            className={navBtn}
            onClick={() => onPageChange(page - 1)}
            disabled={disabled || page <= 1}
            aria-label="Previous page"
          >
            <ChevronLeft size={16} />
          </button>

          {getPageItems(page, totalPages).map((item) =>
            typeof item === "string" ? (
              <span key={item} className="w-8 text-center text-secondary">…</span>
            ) : (
              <button
                key={item}
                type="button"
                onClick={() => onPageChange(item)}
                disabled={disabled}
                aria-label={`Page ${item}`}
                aria-current={item === page ? "page" : undefined}
                className={`min-w-8 h-8 px-2 rounded-lg border text-sm transition-colors disabled:pointer-events-none ${
                  item === page
                    ? "bg-primary text-white border-primary font-medium"
                    : "border-theme text-theme hover:bg-primary-light/20"
                }`}
              >
                {item}
              </button>
            )
          )}

          <button
            type="button"
            className={navBtn}
            onClick={() => onPageChange(page + 1)}
            disabled={disabled || page >= totalPages}
            aria-label="Next page"
          >
            <ChevronRight size={16} />
          </button>
        </nav>
      )}
    </div>
  );
}
