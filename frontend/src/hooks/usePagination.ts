import { useState, useMemo } from "react";

export interface PaginationOptions {
  initialPage?: number;
  initialPageSize?: number;
  pageSizeOptions?: number[];
}

export interface PaginationResult {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  startIndex: number;
  endIndex: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  goToPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  setPageSize: (size: number) => void;
  reset: () => void;
}

/**
 * Hook for client-side pagination
 * @param items - Array of items to paginate
 * @param options - Pagination options
 * @returns Pagination state and controls
 */
export function usePagination<T>(
  items: T[],
  options: PaginationOptions = {}
): PaginationResult & { paginatedItems: T[] } {
  const {
    initialPage = 1,
    initialPageSize = 20,
    pageSizeOptions = [10, 20, 50, 100],
  } = options;

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / pageSize);

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);

  const paginatedItems = useMemo(
    () => items.slice(startIndex, endIndex),
    [items, startIndex, endIndex]
  );

  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;

  const goToPage = (page: number) => {
    const pageNumber = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(pageNumber);
  };

  const nextPage = () => {
    if (hasNextPage) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const previousPage = () => {
    if (hasPreviousPage) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleSetPageSize = (size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  const reset = () => {
    setCurrentPage(initialPage);
    setPageSize(initialPageSize);
  };

  return {
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    startIndex,
    endIndex,
    hasNextPage,
    hasPreviousPage,
    paginatedItems,
    goToPage,
    nextPage,
    previousPage,
    setPageSize: handleSetPageSize,
    reset,
  };
}

/**
 * Hook for server-side pagination
 * @param totalItems - Total number of items on server
 * @param options - Pagination options
 * @returns Pagination state and controls
 */
export function useServerPagination(
  totalItems: number,
  options: PaginationOptions = {}
): PaginationResult {
  const { initialPage = 1, initialPageSize = 20 } = options;

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);

  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;

  const goToPage = (page: number) => {
    const pageNumber = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(pageNumber);
  };

  const nextPage = () => {
    if (hasNextPage) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const previousPage = () => {
    if (hasPreviousPage) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleSetPageSize = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const reset = () => {
    setCurrentPage(initialPage);
    setPageSize(initialPageSize);
  };

  return {
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    startIndex,
    endIndex,
    hasNextPage,
    hasPreviousPage,
    goToPage,
    nextPage,
    previousPage,
    setPageSize: handleSetPageSize,
    reset,
  };
}
