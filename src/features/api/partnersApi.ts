// src/features/api/partnersApi.ts
import { baseApi } from './api'; // Import your global base API
import type { Partner, FilterOption, ApiResponse } from '@/types/partners';

export const partnersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPartners: builder.query<ApiResponse<Partner>, { filters: Record<string, string | string[]>; page?: number }>({
      query: ({ filters, page = 1 }) => {
        const params: Record<string, string | number | string[]> = { page: String(page) };
        for (const key in filters) {
          if (Object.prototype.hasOwnProperty.call(filters, key) && filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
            params[key] = filters[key];
          }
        }
        return {
          url: '/partners',
          params: params,
        };
      },
      transformResponse: (response: ApiResponse<Partner>) => response,
      providesTags: (result) =>
        result
          ? [...result.data.map(({ id }) => ({ type: 'Partners' as const, id })), 'Partners']
          : ['Partners'],
    }),

    getPartnerOptions: builder.query<ApiResponse<FilterOption>, 'nature-partners' | 'structure-partners' | 'status-partners'>({
      query: (endpoint) => `/${endpoint}`,
      providesTags: (_result, _error, arg) => {
        if (arg === 'nature-partners') {
          return [{ type: 'NaturePartners', id: 'LIST' }] as const; // FIX: Apply 'as const' to the array literal
        }
        if (arg === 'structure-partners') {
          return [{ type: 'StructurePartners', id: 'LIST' }] as const; // FIX: Apply 'as const' to the array literal
        }
        if (arg === 'status-partners') {
          return [{ type: 'StatusPartners', id: 'LIST' }] as const; // FIX: Apply 'as const' to the array literal
        }
        return [];
      },
    }),

    addPartner: builder.mutation<Partner, FormData>({
      query: (data) => ({
        url: '/partners',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Partners'],
    }),

    updatePartner: builder.mutation<Partner, { id: number; data: FormData }>({
      query: ({ id, data }) => ({
        url: `/partners/${id}`,
        method: 'POST',
        body: (() => {
          data.append('_method', 'PUT');
          return data;
        })(),
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Partners', id }],
    }),

    deletePartners: builder.mutation<void, number[]>({
      query: (ids) => ({
        url: '/partners/bulk-delete',
        method: 'POST',
        body: { ids },
      }),
      invalidatesTags: ['Partners'],
    }),
  }),
});

export const {
  useGetPartnersQuery,
  useGetPartnerOptionsQuery,
  useAddPartnerMutation,
  useUpdatePartnerMutation,
  useDeletePartnersMutation,
} = partnersApi;