export interface Product {
  id: number;
  product_id: number;
  name: string;
  description: string | null;
  status?: number;
  created_at: string;
  updated_at?: string;
  category_id: number;
  category_name: string;
  product_type_id: number;
  product_type_name: string;
  deleted_at: string | null ; // 
}

export interface ProductQueryParams {
  page: number;
  perPage: number;
  search?: string;
  withTrashed?: boolean;
}

export interface ProductResponse {
  data: Product[];
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    links: {
      url: string | null;
      label: string;
      active: boolean;
    }[];
    path: string;
    per_page: number;
    to: number;
    total: number;
  };
}



export interface ProductDeleteParams {
  ids: string[];
}
export interface ProductMutationParams {
  product_id: number;
  name?: string;
  description?: string | null;
  category_id?: number;
  product_type_id?: number;
  deleted_at?: boolean; // ✅ Used to toggle status (true = delete, false = active)
}