import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface NaturePartner {
  id: number;
  name: string;
}

export const naturePartnersApi = createApi({
  reducerPath: 'naturePartnersApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:8000/api',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) headers.set('Authorization', `Bearer ${token}`);
      headers.set('Accept', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['NaturePartners'],
  endpoints: (builder) => ({
    getNaturePartners: builder.query<NaturePartner[], void>({
      query: () => '/nature-partners',
      transformResponse: (response: { data: NaturePartner[] }) => response.data,
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