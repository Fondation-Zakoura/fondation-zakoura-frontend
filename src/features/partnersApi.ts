import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { Partner, FilterOption, ApiResponse } from '../types/partners';

export const partnersApi = createApi({
  reducerPath: 'partnersApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://127.0.0.1:8000/api',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('authToken');
      if (token) headers.set('Authorization', `Bearer ${token}`);
      headers.set('Accept', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['Partners'],
  endpoints: (builder) => ({
    getPartners: builder.query<ApiResponse<Partner>, { filters: Record<string, any>; page?: number }>({
      query: ({ filters, page = 1 }) => ({
        url: '/partners',
        params: { ...filters, page },
      }),
      providesTags: ['Partners'],
    }),
       getOptions: builder.query<FilterOption[], string>({
      query: (endpoint) => `/${endpoint}`,
      // FIX: Transform the response to ensure it's always an array.
      // This handles cases where the API returns { "data": [...] }.
      transformResponse: (response: { data: FilterOption[] } | FilterOption[]) => {
        if (Array.isArray(response)) {
            return response;
        }
        return response?.data || [];
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
      invalidatesTags: ['Partners'],
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
  useGetOptionsQuery,
  useAddPartnerMutation,
  useUpdatePartnerMutation,
  useDeletePartnersMutation,
} = partnersApi;