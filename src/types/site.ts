// src/types/Site.ts

// For geographic data, these interfaces should probably exist in geographicApi.ts or a shared types file
export interface Region {
  id: number;
  name: string;
  // ... other region properties
}

export interface Province {
  id: number;
  name: string;
  region_id: number;
  region?: Region; // Optional, if you get nested region data
  // ... other province properties
}

export interface Commune {
  id: number;
  name: string;
  province_id: number;
  province?: Province; // Optional, if you get nested province data
  cercle?: { // Assuming cercle is also nested
    id: number;
    name: string;
    province_id: number;
    province?: Province;
    // ... other cercle properties
  };
  // ... other commune properties
}

// Define the exact literal types for 'type' and 'status'
export type SiteType = "Rural" | "Urbain" | "Semi-urbain";
export type SiteStatus = "Actif" | "Fermé" | "En pause" | "Archivé";


// Update the Site interface to reflect the actual nested structure,
// assuming your API returns nested geographic data.
export interface Site {
  id: number;
  site_id: string;
  name: string;
  internal_code: string;
  partner_reference_code?: string;
  type: SiteType; // Changed to use the specific union type
  commune_id: number; // Assuming you have a direct ID for the commune relationship
  commune?: Commune; // Nested commune object, if returned by API
  province_id?: number; // Might not be directly on Site if derived from commune
  province?: Province; // Nested province object, if returned by API
  region_id?: number; // Might not be directly on Site if derived from commune -> cercle -> province -> region
  region?: Region; // Nested region object, if returned by API (less common to have it directly on Site if it's deeply nested)
  country: string; // Likely a code or name
  start_date: string; // ISO date string
  status: SiteStatus; // Changed to use the specific union type
  latitude?: number;
  longitude?: number;
  local_operational_manager_id?: number;
  observations?: string;
  created_by: number;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
  deleted_at?: string | null;
}

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
  // Add other meta properties as needed
}

export interface ApiResponse<T> {
  data: T[];
  links?: ApiLinks; // Define a proper interface for links
  meta?: ApiMeta;  // Define a proper interface for meta if needed
}