import { baseApi } from './api'; 
import type { NaturePartner, NaturePartnersApiResponse } from '@/types/naturePartners'; // Import the new type definition

export const naturePartnersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getNaturePartners: builder.query<NaturePartnersApiResponse, void>({
      query: () => '/nature-partners',
      transformResponse: (response: NaturePartnersApiResponse) => response, 
      providesTags: ['NaturePartners'],
    }),
    addNaturePartner: builder.mutation<NaturePartner, { name: string }>({
      query: (data) => ({
        url: '/nature-partners',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['NaturePartners'],
    }),
    updateNaturePartner: builder.mutation<NaturePartner, { id: number; name: string }>({
      query: ({ id, name }) => ({
        url: `/nature-partners/${id}`,
        method: 'PUT',
        body: { name },
      }),
      invalidatesTags: ['NaturePartners'],
    }),
    deleteNaturePartner: builder.mutation<void, number>({
      query: (id) => ({
        url: `/nature-partners/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['NaturePartners'],
    }),
  }),
});

export const {
  useGetNaturePartnersQuery,
  useAddNaturePartnerMutation,
  useUpdateNaturePartnerMutation,
  useDeleteNaturePartnerMutation,
} = naturePartnersApi;