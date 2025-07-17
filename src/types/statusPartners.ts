export interface StatusPartner {
  id: number;
  name: string;
  // Add any other properties of a NaturePartner here
}

export interface StatusPartnersApiResponse {
  data: StatusPartner[];
  meta?: {
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
    from: number;
    to: number;
  };
    
}