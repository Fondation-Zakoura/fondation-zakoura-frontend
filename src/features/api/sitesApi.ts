import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type{ Site, ApiResponse } from "@/types/site"; // Import from your types file

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
    getSites: builder.query<ApiResponse<Site>, { filters: Record<string, string | string[]>; page?: number }>({
      query: ({ filters, page = 1 }) => {
        const params: Record<string, string | number | string[]> = { page };

        // Process filters for backend compatibility
        for (const key in filters) {
          if (Object.prototype.hasOwnProperty.call(filters, key)) {
            const value = filters[key];
            if (value !== null && value !== undefined && value !== '') { // Ensure value is not empty
              // Example: If 'region.name' filter is sent from frontend
              // Your backend might expect 'region_name' or 'region_id'
              // Adjust this logic based on your actual backend API's filter parameter names
              if (key === 'region.name') {
                // If your backend expects a specific parameter for region name
                // For example, if your backend uses 'region_name' for filtering by name:
                params['region_name'] = value;
                // Or if it expects 'region_id' and you need to look up the ID:
                // This would require fetching regions and mapping name to ID,
                // which is often better handled on the backend or in a pre-processing step.
                // For now, assuming your backend can handle 'region_name' or similar if not 'region.name' directly.
              } else {
                params[key] = value;
              }
            }
          }
        }
        return {
          url: '/sites',
          params: params,
        };
      },
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
        method: 'POST', // Use POST for FormData with _method=PUT
        body: (() => {
          data.append('_method', 'PUT'); // Laravel expects this for PUT with FormData
          return data;
        })(),
      }),
      invalidatesTags: ['Sites'],
    }),
    deleteSites: builder.mutation<void, number[]>({
      query: (ids) => ({
        url: '/sites/bulk-delete',
        method: 'POST',
        body: { ids }, // Send an array of IDs
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