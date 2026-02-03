import { useMemo } from "react";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize?: number;
  totalItems?: number;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  maxVisiblePages?: number;
  showPageSize?: boolean;
  showInfo?: boolean;
  className?: string;
}

/**
 * Pagination component with page numbers and controls
 */
export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  pageSize = 20,
  totalItems,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  maxVisiblePages = 7,
  showPageSize = true,
  showInfo = true,
  className = "",
}: PaginationProps) {
  const pageNumbers = useMemo(() => {
    const pages: (number | string)[] = [];

    if (totalPages <= maxVisiblePages) {
      // Show all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show subset with ellipsis
      const leftSiblingIndex = Math.max(currentPage - 1, 1);
      const rightSiblingIndex = Math.min(currentPage + 1, totalPages);

      const shouldShowLeftDots = leftSiblingIndex > 2;
      const shouldShowRightDots = rightSiblingIndex < totalPages - 1;

      // Always show first page
      pages.push(1);

      if (shouldShowLeftDots) {
        pages.push("...");
      }

      // Show current page and siblings
      for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
        if (i !== 1 && i !== totalPages) {
          pages.push(i);
        }
      }

      if (shouldShowRightDots) {
        pages.push("...");
      }

      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  }, [currentPage, totalPages, maxVisiblePages]);

  if (totalPages <= 1) {
    return null;
  }

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems || currentPage * pageSize);

  return (
    <div className={`flex items-center justify-between ${className}`}>
      {/* Info */}
      {showInfo && totalItems !== undefined && (
        <div className="text-sm text-gray-700">
          Affichage de <span className="font-medium">{startItem}</span> à{" "}
          <span className="font-medium">{endItem}</span> sur{" "}
          <span className="font-medium">{totalItems}</span> résultats
        </div>
      )}

      {/* Pagination controls */}
      <div className="flex items-center gap-2">
        {/* Previous button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Page précédente"
        >
          ←
        </button>

        {/* Page numbers */}
        <div className="flex gap-1">
          {pageNumbers.map((page, index) => {
            if (page === "...") {
              return (
                <span key={`ellipsis-${index}`} className="px-3 py-1 text-gray-500">
                  ...
                </span>
              );
            }

            return (
              <button
                key={page}
                onClick={() => onPageChange(page as number)}
                className={`px-3 py-1 rounded border transition-colors ${
                  currentPage === page
                    ? "bg-hagen-700 text-white border-hagen-700"
                    : "border-gray-300 hover:bg-gray-50"
                }`}
                aria-label={`Page ${page}`}
                aria-current={currentPage === page ? "page" : undefined}
              >
                {page}
              </button>
            );
          })}
        </div>

        {/* Next button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Page suivante"
        >
          →
        </button>

        {/* Page size selector */}
        {showPageSize && onPageSizeChange && (
          <select
            value={pageSize}
            onChange={e => onPageSizeChange(Number(e.target.value))}
            className="ml-4 px-2 py-1 rounded border border-gray-300 hover:bg-gray-50"
            aria-label="Éléments par page"
          >
            {pageSizeOptions.map(size => (
              <option key={size} value={size}>
                {size} / page
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}

/**
 * Simple pagination component (just prev/next)
 */
export function SimplePagination({
  hasNext,
  hasPrevious,
  onNext,
  onPrevious,
  className = "",
}: {
  hasNext: boolean;
  hasPrevious: boolean;
  onNext: () => void;
  onPrevious: () => void;
  className?: string;
}) {
  return (
    <div className={`flex items-center justify-center gap-4 ${className}`}>
      <button
        onClick={onPrevious}
        disabled={!hasPrevious}
        className="px-4 py-2 rounded bg-hagen-700 text-white hover:bg-hagen-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        ← Précédent
      </button>
      <button
        onClick={onNext}
        disabled={!hasNext}
        className="px-4 py-2 rounded bg-hagen-700 text-white hover:bg-hagen-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Suivant →
      </button>
    </div>
  );
}
