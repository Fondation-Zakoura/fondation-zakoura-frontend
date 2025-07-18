// src/features/api/sitesApi.ts
import { baseApi } from './api';
import type { Site, ApiResponse } from "@/types/site";

export const sitesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSites: builder.query<ApiResponse<Site>, { filters: Record<string, string | string[]>; page?: number; pageSize?: number; sortConfig?: { key: string; direction: 'asc' | 'desc' } | null; globalSearchTerm?: string }>({
      query: ({ filters, page = 1, pageSize = 10, sortConfig, globalSearchTerm }) => {
        const params: Record<string, string | number | string[]> = {
          page: String(page),
          per_page: String(pageSize), // Add per_page for backend pagination
        };

        // Add global search term
        if (globalSearchTerm) {
          params['search'] = globalSearchTerm; // Assuming backend uses 'search' for global filter
        }

        // Map frontend filter keys to backend parameter names
        for (const key in filters) {
          if (Object.prototype.hasOwnProperty.call(filters, key)) {
            const value = filters[key];
            if (value !== null && value !== undefined && value !== '') {
              if (key === 'commune.cercle.province.region.name') {
                params['region_name'] = value;
              } else if (key === 'commune.cercle.province.name') {
                params['province_name'] = value;
              } else if (key === 'commune.cercle.name') {
                params['cercle_name'] = value;
              } else if (key === 'commune.name') {
                params['commune_name'] = value;
              } else {
                params[key] = value; // Use the key as-is for other filters like 'type', 'status'
              }
            }
          }
        }

        // Add sorting parameters
        if (sortConfig && sortConfig.key) {
          params['sort_by'] = sortConfig.key;
          params['sort_direction'] = sortConfig.direction;
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
    allSiteUsers: builder.query<ApiResponse<Site>, void>({
      query: () => '/sites/users',
      transformResponse: (response: ApiResponse<Site>) => response,
      providesTags: (result) =>
        result
          ? [...result.data.map(({ id }) => ({ type: 'Sites' as const, id })), 'Sites']
          : ['Sites'],
    })
  }),
});

export const {
  useGetSitesQuery,
  useAddSiteMutation,
  useUpdateSiteMutation,
  useDeleteSitesMutation,
  useAllSiteUsersQuery
} = sitesApi;
