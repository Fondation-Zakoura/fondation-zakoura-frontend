export interface Project {
  id: number;
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
}

export interface ProjectType {
  id: number;
  name: string;
  description?: string;
}

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
}