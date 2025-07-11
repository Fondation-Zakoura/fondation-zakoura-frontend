import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { Level, ApiResponse, FilterOption  } from '@/types/levels'; // Assurez-vous que les types sont corrects

export const levelApi = createApi({
  reducerPath: 'levelApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:8000/api', // Assurez-vous que c'est l'URL correcte de votre backend
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token'); // Récupérez votre token d'authentification
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      headers.set('Accept', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['Levels', 'LevelOptions'], // Types de tags pour l'invalidation du cache
  endpoints: (builder) => ({
    getLevels: builder.query<ApiResponse<Level>, { filters?: Record<string, any>; page?: number; withTrashed?: boolean }>({
      query: ({ filters = {}, page = 1, withTrashed = false }) => {
        const params: Record<string, any> = { ...filters, page };
        if (withTrashed) {
          params.with_trashed = true; // Paramètre pour inclure les éléments soft-deleted
        }
        console.log("Paramètres envoyés à l'API levels:", params); // Pour le débogage
        return {
          url: '/levels',
          params: params,
        };
      },
      providesTags: ['Levels'],
    }),
    getLevelById: builder.query<Level, number>({
      query: (id) => `/levels/${id}`,
      providesTags: (result, error, id) => [{ type: 'Levels', id }],
    }),
    createLevel: builder.mutation<Level, FormData>({
      query: (data) => ({
        url: '/levels',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Levels'],
    }),
    updateLevel: builder.mutation<Level, { id: number; data: FormData }>({
      query: ({ id, data }) => ({
        url: `/levels/${id}`,
        method: 'POST', // Laravel utilise POST avec _method=PUT pour les requêtes FormData
        body: (() => {
          data.append('_method', 'PUT'); // Ajouter _method pour simuler PUT
          return data;
        })(),
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Levels', id }, 'Levels'],
    }),
    // Cette mutation gérera à la fois la suppression (désactivation) et la restauration (activation)
    bulkToggleLevelsStatus: builder.mutation<void, number[]>({
      query: (ids) => ({
        url: '/levels/bulk-delete', // Endpoint pour le toggle de statut en masse
        method: 'POST',
        body: { level_ids: ids }, // Assurez-vous que le backend attend 'level_ids'
      }),
      invalidatesTags: ['Levels'],
    }),
    getFormOptions: builder.query<{ cycles: FilterOption[] }, void>({
      query: () => '/level-form-options',
      providesTags: ['LevelOptions'],
    }),
  }),
});

export const {
  useGetLevelsQuery,
  useGetLevelByIdQuery,
  useCreateLevelMutation,
  useUpdateLevelMutation,
  useBulkToggleLevelsStatusMutation, 
  useGetFormOptionsQuery,
} = levelApi;
