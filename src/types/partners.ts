// src/types/partners.ts

export interface ContactPerson {
  id?: number;
  partner_id?: number;
  last_name: string;
  first_name: string;
  position: string;
  email: string;
  phone: string;
  address?: string;
}

// Keeping these for now, but generally, it's better to have one consistent interface name if they represent the same data.
export interface PersonneContact {
  id?: number;
  partner_id?: number;
  last_name: string;
  first_name: string;
  position: string;
  email: string;
  phone: string;
  address?: string;
}

export interface contact_people {
  id?: number;
  partner_id?: number;
  last_name: string;
  first_name: string;
  position: string;
  email: string;
  phone: string;
  address?: string;
}

export interface Partner {
  id: number;
  partner_name: string;
  abbreviation: string;
  phone: string | null;
  email: string | null;
  partner_type: string; // e.g., "National", "International"
  nature_partner: string; // e.g., "Public", "Privé"
  structure_partner: string; // e.g., "ONG", "Association"
  status: string; // e.g., "Actif", "En pause"
  actions: string | null; // This field name seems unusual for actions, maybe 'action_status' or similar?
  address: string | null;
  country: string | null;
  note: string | null;
  partner_logo: string | null; // Assuming this is a path or ID to the logo
  logo_url?: string; // The full URL to the logo
  contact_people: ContactPerson[];
  is_active?: boolean; // Derived from 'deleted_at' in some cases
  deleted_at?: string | null; // ISO date string if deleted, null otherwise
}

export interface FilterOption {
  id: number | string;
  name: string;
  data?: unknown; // For any additional data
}

export interface OptionItem {
  id: string | number;
  name: string;
}

// Standard API Response structure for collections with pagination
export interface ApiLinks {
  first?: string;
  last?: string;
  prev?: string | null;
  next?: string | null;
  [key: string]: string | null | undefined;
}

export interface ApiMeta {
  current_page?: number;
  from?: number;
  last_page?: number;
  path?: string;
  per_page?: number;
  to?: number;
  total?: number;
  links?: Array<{
    url: string | null;
    label: string;
    active: boolean;
  }>;
}

export interface ApiResponse<T> {
  data: T[];
  links?: ApiLinks; // Optional, for pagination links
  meta?: ApiMeta;   // Optional, for pagination metadata
}

export interface ColumnFilter {
  id: string;
  label: string;
  options: OptionItem[];
  isLoading?: boolean; 
}