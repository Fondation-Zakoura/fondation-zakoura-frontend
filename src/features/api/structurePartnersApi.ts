import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface StructurePartner {
  id: number;
  name: string;
}

export const structurePartnersApi = createApi({
  reducerPath: 'structurePartnersApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_API_URL}`,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) headers.set('Authorization', `Bearer ${token}`);
      headers.set('Accept', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['StructurePartners'],
  endpoints: (builder) => ({
    getStructurePartners: builder.query<StructurePartner[], void>({
      query: () => '/structure-partners',
      transformResponse: (response: { data: StructurePartner[] }) => response.data,
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
} = structurePartnersApi;