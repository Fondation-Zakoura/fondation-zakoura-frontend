// src/features/api/sitesApi.ts
import { baseApi } from './api';
import type { Site, ApiResponse } from "@/types/site";

export const sitesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSites: builder.query<ApiResponse<Site>, { filters: Record<string, string | string[]>; page?: number }>({
      query: ({ filters, page = 1 }) => {
        const params: Record<string, string | number | string[]> = { page: String(page) };

        for (const key in filters) {
          if (Object.prototype.hasOwnProperty.call(filters, key)) {
            const value = filters[key];
            if (value !== null && value !== undefined && value !== '') {
              // --- FIX START ---
              // Map frontend filter keys to backend parameter names
              if (key === 'commune.cercle.province.region.name') {
                params['region_name'] = value; // Your backend likely expects 'region_name' or similar
              } else if (key === 'commune.cercle.province.name') {
                params['province_name'] = value; // Assuming filter by province name
              } else if (key === 'commune.cercle.name') {
                params['cercle_name'] = value; // Assuming filter by cercle name
              } else if (key === 'commune.name') {
                params['commune_name'] = value; // Assuming filter by commune name
              } else {
                params[key] = value; // Use the key as-is for other filters like 'type', 'status', 'educator'
              }
              // --- FIX END ---
            }
          }
        }
        return {
          url: '/sites',
          params: params,
        };
      },
      transformResponse: (response: ApiResponse<Site>) => response,
      providesTags: (result) =>
        result
          ? [...result.data.map(({ id }) => ({ type: 'Sites' as const, id })), 'Sites']
          : ['Sites'],
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
      // FIX: Prefix 'result' and 'error' with an underscore
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Sites' as const, id }],
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