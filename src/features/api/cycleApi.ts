// src/features/api/cycleApi.ts

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { Cycle, CycleFormData, ApiResponse } from '@/types/cycles';

export const cycleApi = createApi({
  reducerPath: 'cycleApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:8000/api',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) headers.set('Authorization', `Bearer ${token}`);
      headers.set('Accept', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['Cycles'], // Types de tags pour l'invalidation du cache
  endpoints: (builder) => ({
    getCycles: builder.query<ApiResponse<Cycle>, { filters: Record<string, any>; page?: number }>({
      query: ({ filters, page = 1 }) => ({
        url: '/cycles',
        params: { ...filters, page },
      }),
      providesTags: ['Cycles'],
    }),
    getCycleById: builder.query<Cycle, number>({
      query: (id) => `/cycles/${id}`,
      providesTags: (result, error, id) => [{ type: 'Cycles', id }],
    }),
    createCycle: builder.mutation<Cycle, FormData>({
      query: (data) => ({
        url: '/cycles',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Cycles'],
    }),
    updateCycle: builder.mutation<Cycle, { id: number; data: FormData }>({
      query: ({ id, data }) => ({
        url: `/cycles/${id}`,
        method: 'POST', // Laravel utilise POST avec _method=PUT pour les requêtes FormData
        body: (() => {
          data.append('_method', 'PUT'); // Ajouter _method pour simuler PUT
          return data;
        })(),
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Cycles', id }, 'Cycles'],
    }),
    deleteCycles: builder.mutation<void, number[]>({
      query: (ids) => ({
        url: '/cycles/bulk-delete', 
        method: 'POST', 
        body: { cycle_ids: ids }, 
      }),
      invalidatesTags: ['Cycles'],
    }),
  }),
});

export const {
  useGetCyclesQuery,
  useGetCycleByIdQuery,
  useCreateCycleMutation,
  useUpdateCycleMutation,
  useDeleteCyclesMutation,
} = cycleApi;
