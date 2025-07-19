
export interface PackArticle {
  article_id: number;
  name: string;
  brand?: string;
  product_name:string;
  reference_price: string;
  specifications?: string;
  quantity: number;
}

export interface Pack {
  pack_id: number;
  name: string;
  deleted_at: boolean | null;
  created_at?: string;
  articles?: PackArticle[];
  description?: string;

  
}

export interface PackQueryParams {
  page?: number;
  perPage?: number;
  search?: string;
  withTrashed?: boolean;
}

export interface PackResponse {
  data: Pack[];
  pagination?: {
    total: number;
    perPage: number;
    currentPage: number;
  };
}

export interface SinglePackResponse {
  data: Pack;
}

export interface DeleteResponse {
  success: boolean;
  id: number;
}

export interface BulkDeleteResponse {
  success: boolean;
  ids: number[];
}

export interface TransformedPack {
  id: number;
  pack_id: number;
  name: string;
  description: string;
  articlesCount: number;
  articles: PackArticle[]; // You can later type this properly
  created_at: string;
  created_by: string;
  deleted_at: boolean | null;
  status: "1" | "0";
}