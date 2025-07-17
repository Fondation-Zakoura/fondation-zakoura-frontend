import { baseApi } from './api'; 
import type { StatusPartner , StatusPartnersApiResponse } from '@/types/statusPartners'; // Import the new type definition

export const statusPartnersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStatusPartners: builder.query<StatusPartnersApiResponse, void>({
      query: () => '/status-partners',
      transformResponse: (response: StatusPartnersApiResponse) => response, 
      providesTags: ['StatusPartners'],
    }),
    addStatusPartner: builder.mutation<StatusPartner, { name: string }>({
      query: (data) => ({
        url: '/status-partners',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['StatusPartners'],
    }),
    updateStatusPartner: builder.mutation<StatusPartner, { id: number; name: string }>({
      query: ({ id, name }) => ({
        url: `/status-partners/${id}`,
        method: 'PUT',
        body: { name },
      }),
      invalidatesTags: ['StatusPartners'],
    }),
    deleteStatusPartner: builder.mutation<void, number>({
      query: (id) => ({
        url: `/status-partners/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['StatusPartners'],
    }),
  }),
});

export const {
  useGetStatusPartnersQuery,
  useAddStatusPartnerMutation,   
  useUpdateStatusPartnerMutation,
  useDeleteStatusPartnerMutation,
} = statusPartnersApi