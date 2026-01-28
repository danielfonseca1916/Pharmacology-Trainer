/**
 * Pagination utilities for efficient list handling
 */

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginationResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * Paginate an array of items
 * @param items Array of items to paginate
 * @param page Page number (1-indexed)
 * @param pageSize Number of items per page
 * @returns Pagination result with items and metadata
 */
export function paginate<T>(
  items: T[],
  page: number = 1,
  pageSize: number = 10
): PaginationResult<T> {
  // Validate input
  const validPage = Math.max(1, page);
  const validPageSize = Math.max(1, Math.min(pageSize, 100)); // Max 100 per page

  const start = (validPage - 1) * validPageSize;
  const end = start + validPageSize;
  const paginatedItems = items.slice(start, end);
  const total = items.length;
  const totalPages = Math.ceil(total / validPageSize);

  return {
    items: paginatedItems,
    page: validPage,
    pageSize: validPageSize,
    total,
    totalPages,
    hasNextPage: validPage < totalPages,
    hasPrevPage: validPage > 1,
  };
}

/**
 * Parse pagination params from URL search params
 * @param searchParams URLSearchParams or object with page and pageSize
 * @returns Pagination params
 */
export function parsePaginationParams(
  searchParams: Record<string, string | string[] | undefined> | URLSearchParams
): PaginationParams {
  let page = 1;
  let pageSize = 10;

  if (searchParams instanceof URLSearchParams) {
    page = parseInt(searchParams.get("page") || "1", 10);
    pageSize = parseInt(searchParams.get("pageSize") || "10", 10);
  } else {
    page = parseInt(String(searchParams.page || "1"), 10);
    pageSize = parseInt(String(searchParams.pageSize || "10"), 10);
  }

  return {
    page: Math.max(1, page),
    pageSize: Math.max(1, Math.min(pageSize, 100)),
  };
}

/**
 * Build URL search params for pagination
 * @param page Page number
 * @param pageSize Items per page
 * @returns Query string
 */
export function buildPaginationQuery(page: number, pageSize: number = 10): string {
  const params = new URLSearchParams();
  if (page > 1) params.append("page", String(page));
  if (pageSize !== 10) params.append("pageSize", String(pageSize));
  return params.toString();
}
