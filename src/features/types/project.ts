export interface Project {
  id: number;
<<<<<<< HEAD
  title: string;
  description: string;
  type_id: number;
  status_id: number;
  start_date: string;
  end_date: string;
  budget: number;
  location: string;
  beneficiaries: number;
  created_at: string;
  updated_at: string;
  type?: ProjectType;
  status?: ProjectStatus;
=======
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
  project_bank_account?:ProjectBankAccount;
  project_nature:string;
  updated_at: string;
  project_type?: ProjectType;
  project_status?: ProjectStatus;
>>>>>>> a1b5ad8 (feat: Add Project Management and Liste)
}

export interface ProjectType {
  id: number;
  name: string;
  description?: string;
}

<<<<<<< HEAD
=======
export interface User{
  id:number;
  name:string;
  email:string;
  created_at:string;
  updated_at:string;
}

>>>>>>> a1b5ad8 (feat: Add Project Management and Liste)
export interface ProjectStatus {
  id: number;
  name: string;
  description?: string;
  color?: string;
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
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
<<<<<<< HEAD
=======
}



export interface ProjectBankAccount{
  id: number;
  rib: string;
  agency: string;
  bank: string;
}

export interface ProjectsQueryParams {
  page?: number;
  per_page?: number;
  sort?: string;
  filter?: string; 
>>>>>>> a1b5ad8 (feat: Add Project Management and Liste)
}