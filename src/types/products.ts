
export interface PaginationInfo {
  total: number;
  per_page: number;
  current_page: number;
  total_pages: number;
}

// Main interface for a single Product object
export interface Product {
  product_id: number; // Using this as the single, primary ID
  name: string;
  description: string | null;
  status?: number;
  created_at: string;
  updated_at?: string;
  category_id: number;
  category_name: string;
  product_type_id: number;
  product_type_name: string;
  deleted_at: string | null;
}

// Interface for the API response when fetching a list of products
export interface ProductResponse {
  data: Product[];
  pagination: PaginationInfo; // Consistent with your other API responses
}

// Interface for the query parameters sent to the API
export interface ProductQueryParams {
  page: number;
  perPage: number;
  search?: string;
  withTrashed?: boolean;
  sort_by?: string | null;
  sort_direction?: 'asc' | 'desc' | null;
  filter?: Record<string, any>;
}

// Interface for updating or creating a product
export interface ProductMutationParams {
  product_id?: number; // Optional for creation, required for update
  name?: string;
  description?: string | null;
  category_id?: number;
  product_type_id?: number;
  deleted_at?: boolean; // Used to toggle active/inactive status
}

// Interface for bulk-deleting products
export interface ProductDeleteParams {
  ids: (string | number)[];
}