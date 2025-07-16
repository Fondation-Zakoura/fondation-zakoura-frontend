
export interface Article {
  article_id: number;
  product_id: number;
  product_name: string;
  name: string;
  specifications?: string;
  brand?: string;
  reference_price?: number;
  deleted_at: string | null;
  created_at?: string;
 
}

export interface ArticleQueryParams {
  page?: number;
  perPage?: number;
  search?: string;
  productId?: number;
  brand?: string;
  withTrashed?: boolean;
}

export interface ArticleListResponse {
  data: Article[];
  pagination?: {
    total: number;
    perPage: number;
    currentPage: number;
  };
}

export interface SingleArticleResponse {
  data: Article;
}

export interface ArticleMutationParams {
  article_id: number;
  product_id?: number;
  name?: string;
  specifications?: string;
  brand?: string;
  reference_price?: number;
  deleted_at?: boolean; // ✅ Used to toggle status (true = delete, false = active)
}

export interface DeleteResponse {
  success: boolean;
  id: number;
}

export interface BulkDeleteResponse {
  success: boolean;
  ids: string[];
}


