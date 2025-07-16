export interface StructurePartner {
    id: number;
    name: string;
    created_at: string;
    updated_at: string;
}

export interface FilterOption {
    id: number | string;
    name: string;
    data?: unknown;
}

export interface StructurePartnersApiResponse {
  data: StructurePartner[];
  current_page?: number;
  last_page?: number;
  per_page?: number;
  total?: number;
}