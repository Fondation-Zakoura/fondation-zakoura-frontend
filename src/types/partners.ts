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
  partner_type: string;
  nature_partner: string;
  structure_partner: string;
  status: string;
  actions: string | null;
  address: string | null;
  country: string | null;
  note: string | null;
  partner_logo: string | null;
  logo_url?: string;
  contact_people: ContactPerson[];
  is_active?: boolean;
}

export interface FilterOption {
  id: number | string;
  name: string;
  data?: any;
}

export interface ApiResponse<T> {
  data: T[];
  meta?: {
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
    from: number;
    to: number;
  };
}
