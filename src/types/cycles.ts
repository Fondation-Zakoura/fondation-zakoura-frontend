export interface Cycle {
  id: number;
  cycle_id: string; 
  title: string;
  code: string;
  order: number;
  status: "Actif" | "Inactif"; 
  created_by?: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;

  creator?: {
    id: number;
    name?: string;
    email?: string;
    first_name?: string;
    last_name?: string;
  };
}

export type CycleFormData = Omit<Cycle, 'id' | 'cycle_id' | 'status' | 'created_at' | 'updated_at' | 'deleted_at' | 'creator'>;

export interface ApiResponse<T> {
  data: T[];
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

export interface FilterOption {
  id: string | number;
  name: string;
}
