import type { Collaborateur, CollaborateurFormOptions, CollaborateursResponse } from '@/types/collaborateurs';
import { baseApi } from './api';

type CollaborateursQueryParams = {
  page?: number;
  per_page?: number;
  search?: string;
  filter?: string;
  sort?: string;
};

export const collaborateursApi = baseApi.enhanceEndpoints({
  addTagTypes: ['Collaborateurs', 'CollaborateurFormOptions'],
}).injectEndpoints({
  endpoints: (builder) => ({
    // Récupération des options pour le formulaire
    getCollaborateurFormOptions: builder.query<CollaborateurFormOptions, void>({
      query: () => '/collaborateurs/options',
      providesTags: ['CollaborateurFormOptions'],
    }),

    // ✅ Récupération paginée des collaborateurs
    getCollaborateurs: builder.query<CollaborateursResponse, CollaborateursQueryParams>({
      query: (params) => ({
        url: '/collaborateurs',
        params,
      }),
      providesTags: ['Collaborateurs'],
    }),

    // ✅ Détail d’un collaborateur
    getCollaborateur: builder.query<Collaborateur, number>({
      query: (id) => `/collaborateurs/${id}`,
    }),

    //  Création d’un collaborateur
    addCollaborateur: builder.mutation<Collaborateur, Partial<Collaborateur>>({
      query: (body) => ({
        url: '/collaborateurs',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Collaborateurs'],
    }),

    // Mise à jour
    updateCollaborateur: builder.mutation<any, { code: string; body: any }>({
          query: ({ code, body }) => ({
            url: `/collaborateurs/${code}`,
            method: 'PUT',
            body,
          }),
          invalidatesTags: ['Collaborateurs'],
        }),



    // Suppression simple
    deleteCollaborateur: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `/collaborateurs/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Collaborateurs'],
    }),
    
    //Suppression multiple
    bulkDeleteCollaborateurs: builder.mutation<{ message: string }, number[]>({
      query: (ids) => ({
        url: `/collaborateurs/bulk-delete`,
        method: 'DELETE',
        body: { collaborateur_ids: ids },
      }),
      invalidatesTags: ['Collaborateurs'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetCollaborateurFormOptionsQuery,
  useGetCollaborateursQuery,
  useGetCollaborateurQuery,
  useAddCollaborateurMutation,
  useUpdateCollaborateurMutation,
  useDeleteCollaborateurMutation,
  useBulkDeleteCollaborateursMutation,
} = collaborateursApi;
