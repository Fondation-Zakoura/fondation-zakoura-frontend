
import type { Cycle } from './cycles'; // Assurez-vous que le type Cycle est défini et importable



export interface User {
  id: number;
  name?: string;
  email?: string;
  created_at?: string;
  updated_at?: string;
}
export interface Level {
  id: number;
  level_id: string; 
  title: string;
  code: string;
  cycle_id: number;
  order: number;
  min_age: number;
  max_age: number;
  status: "Actif" | "Inactif"; 
  created_by?: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null; 

  cycle?: Cycle; 
  creator?: User; 
}



export type LevelFormData = Omit<Level, 'id' | 'level_id' | 'status' | 'created_at' | 'updated_at' | 'deleted_at' | 'creator' | 'cycle'>;

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
  value: string | number;
  label: string;
}
