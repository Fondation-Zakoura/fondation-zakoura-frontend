export interface ProductType {
  id: number;
  name: string;
  created_at: string;
  deleted_at: string | null ;
}

export interface ProductTypeQueryParams {
  page: number;
  perPage: number;
  search?: string;
  withTrashed?: boolean;
}
export interface ProductTypeMutationParams {
  product_type_id: number;
  name: string;
deleted_at?: boolean; // ✅ Used to toggle status (true = delete, false = active)
}

export interface ProductTypeResponse {
  data: ProductType[];
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