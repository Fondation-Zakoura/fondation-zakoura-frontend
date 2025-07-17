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