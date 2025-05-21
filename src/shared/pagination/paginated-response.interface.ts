/**
 * Interface for pagination metadata
 */
export interface PaginationMeta {
  offset: number;
  limit: number;
  total: number;
  hasNextPage: boolean;
}

/**
 * Interface for paginated API responses
 */
export interface PaginatedResponseInterface<T> {
  data: T[];
  meta: PaginationMeta;
} 