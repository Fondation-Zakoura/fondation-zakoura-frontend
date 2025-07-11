import type { Partner } from "./partners";

export interface Project {
  id: number;
  project_code:string;
  project_name: string;
  project_type_id: number;
  project_status_id: number;
  start_date: string;
  end_date: string;
  total_budget: number;
  created_at: string;
  zakoura_contribution : number;
  actual_start_date:string;
  notes:string;
  project_bank_account_id:number;
  responsible?:User;
  responsible_id:number;
  created_by?:User;
  created_by_id:number;
  partners:Partner[];
  project_bank_account?:ProjectBankAccount;
  project_nature:string;
  updated_at: string;
  project_type?: ProjectType;
  project_status?: ProjectStatus;
}

export interface ProjectType {
  id: number;
  name: string;
  created_at?: string;
  updated_at? : string;
}

export interface User{
  id:number;
  name:string;
  email:string;
  created_at:string;
  updated_at:string;
}

export interface ProjectStatus {
  id: number;
  name: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

export interface ProjectsResponse {
  data: Project[];
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    path: string;
    per_page: number;
    to: number;
    total: number;
  };
  links: [];
  last_page:number;
  current_page:number;
  first_page_url:string;
  from:number;
  last_page_url:string;
  next_page_url:string;
  per_page:number;
  prev_page_url:string;
  to:number;
  total:number;
}



export interface ProjectBankAccount{
  id: number;
  rib_iban: string;
  agency: string;
  bank: string;
  account_title:string;
  opening_country: string;
  account_holder_name: string;
  bic_swift : string;
  currency:string;
  opening_date: string;
  supporting_document : string;
  comments : string;
  status: string;
}

export interface ProjectsQueryParams {
  page?: number;
  per_page?: number;
  sort?: string;
  filter?: string; 
}

export type ProjectInputRefKeys =
    | "project_name"
    | "project_nature"
    | "project_type"
    | "project_status"
    | "start_date"
    | "actual_start_date"
    | "end_date"
    | "responsible"
    | "total_budget"
    | "bank_account"
    | "zakoura_contribution";