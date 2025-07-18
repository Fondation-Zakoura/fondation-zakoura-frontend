export interface Category {
  category_id: number;
  name: string;
  description?: string;
  deleted_at: string | null;
  created_at: string;
}



export interface CategoryQueryParams {
  page: number;
  perPage: number;
  search?: string;
  withTrashed?: boolean;
  sort_by?: string | null;
  sort_direction?: 'asc' | 'desc' | null;
  filter?: Record<string, any>; 
}
export interface CategoryMutationParams {
  category_id: number;
  name: string;
  description: string;
}

export interface CategoryDeleteParams {
  ids: string[];
}

export interface CategoryResponse {
  data: Category[];
  pagination: PaginationInfo; // Change 'meta' and 'links' to 'pagination'
}
export interface PaginationInfo {
  total: number;
  count: number;
  per_page: number;
  current_page: number;
  total_pages: number;
}