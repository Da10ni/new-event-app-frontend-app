export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: PaginationMeta;
}
export interface PaginationMeta {
  page: number; limit: number; total: number; totalPages: number; hasNextPage: boolean; hasPrevPage: boolean;
}
