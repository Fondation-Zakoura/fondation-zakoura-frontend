import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface Site {
  id: number;
  site_id: string;
  name: string;
  internal_code: string;
  partner_reference_code?: string;
  type: string;
  commune: string;
  province: string;
  region: string;
  country: string;
  start_date: string;
  status: string;
  latitude?: number;
  longitude?: number;
  local_operational_manager_id?: number;
  observations?: string;
  created_by: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface ApiResponse<T> {
  data: T[];
  links?: any;
  meta?: any;
}

export const sitesApi = createApi({
  reducerPath: 'sitesApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:8000/api',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) headers.set('Authorization', `Bearer ${token}`);
      headers.set('Accept', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['Sites'],
  endpoints: (builder) => ({
    getSites: builder.query<ApiResponse<Site>, { filters: Record<string, any>; page?: number }>({
      query: ({ filters, page = 1 }) => ({
        url: '/sites',
        params: { ...filters, page },
      }),
      providesTags: ['Sites'],
    }),
    addSite: builder.mutation<Site, FormData>({
      query: (data) => ({
        url: '/sites',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Sites'],
    }),
    updateSite: builder.mutation<Site, { id: number; data: FormData }>({
      query: ({ id, data }) => ({
        url: `/sites/${id}`,
        method: 'POST',
        body: (() => {
          data.append('_method', 'PUT');
          return data;
        })(),
      }),
      invalidatesTags: ['Sites'],
    }),
    deleteSites: builder.mutation<void, number[]>({
      query: (ids) => ({
        url: '/sites/bulk-delete',
        method: 'POST',
        body: { ids },
      }),
      invalidatesTags: ['Sites'],
    }),
  }),
});

export const {
  useGetSitesQuery,
  useAddSiteMutation,
  useUpdateSiteMutation,
  useDeleteSitesMutation,
} = sitesApi;