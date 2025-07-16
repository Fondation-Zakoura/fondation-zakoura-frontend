// features/api/structurePartnersApi.ts
import { baseApi } from './api';
import type { StructurePartner, StructurePartnersApiResponse } from '@/types/structurePartners';

export const extendedApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStructurePartners: builder.query<StructurePartnersApiResponse, void>({
      query: () => '/structure-partners',
      transformResponse: (response: StructurePartnersApiResponse) => response,
      providesTags: ['StructurePartners'],
    }),
    addStructurePartner: builder.mutation<StructurePartner, { name: string }>({
      query: (data) => ({
        url: '/structure-partners',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['StructurePartners'],
    }),
    updateStructurePartner: builder.mutation<StructurePartner, { id: number; name: string }>({
      query: ({ id, name }) => ({
        url: `/structure-partners/${id}`,
        method: 'PUT',
        body: { name },
      }),
      invalidatesTags: ['StructurePartners'],
    }),
    deleteStructurePartner: builder.mutation<void, number>({
      query: (id) => ({
        url: `/structure-partners/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['StructurePartners'],
    }),
  }),
});

export const {
  useGetStructurePartnersQuery,
  useAddStructurePartnerMutation,
  useUpdateStructurePartnerMutation,
  useDeleteStructurePartnerMutation,
} = extendedApi;