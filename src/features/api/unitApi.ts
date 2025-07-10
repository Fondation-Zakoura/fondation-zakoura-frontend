// src/features/api/unitApi.ts

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Interfaces for geographic entities (simplifiées pour l'API des unités)
interface Site {
  id: number;
  name: string;
  // Ajoutez d'autres champs de site si nécessaire pour l'affichage ou la logique
  commune?: {
    id: number;
    name: string;
    cercle?: {
      id: number;
      name: string;
      province?: {
        id: number;
        name: string;
        region?: {
          id: number;
          name: string;
        };
      };
    };
  };
}

interface User {
  id: number;
  name: string;
  // Ajoutez d'autres champs utilisateur si nécessaire
}

// Interface pour le modèle Unit
export interface Unit {
  id: number;
  unit_id: string;
  name: string;
  internal_code: string;
  partner_reference_code?: string;
  site_id: number;
  type: "Préscolaire" | "École" | "Regroupement" | "Centre" | "Communautaire";
  number_of_classes: number;
  status: "Active" | "Fermée" | "En pause" | "Archivée";
  educator_id?: number | null;
  observations?: string;
  created_by?: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string; // Pour le soft delete

  // Relations chargées
  site?: Site;
  educator?: User;
  creator?: User;
}

// Interface pour les données de formulaire d'unité (pour la création/mise à jour)
export type UnitFormData = Omit<Unit, 'id' | 'unit_id' | 'created_at' | 'updated_at' | 'deleted_at' | 'site' | 'educator' | 'creator'>;

// Interface pour la réponse paginée de l'API
interface PaginatedUnitsResponse {
  data: Unit[];
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    links: {
      url: string | null;
      label: string;
      active: boolean;
    }[];
    path: string;
    per_page: number;
    to: number;
    total: number;
  };
}

// Interface pour les données de formulaire de création/édition d'unité
interface UnitFormOptions {
  sites: Site[];
  educators: User[];
  unit_types: Unit['type'][];
  unit_statuses: Unit['status'][];
}

export const unitApi = createApi({
  reducerPath: 'unitApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:8000/api/', // Assurez-vous que c'est l'URL correcte de votre backend
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token'); // Récupérez votre token d'authentification
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Units'], // Types de tags pour l'invalidation du cache
  endpoints: (builder) => ({
    getUnits: builder.query<PaginatedUnitsResponse, { page?: number; filters?: Record<string, any> } | void>({
      query: ({ page = 1, filters = {} } = {}) => {
        const params = new URLSearchParams();
        params.append('page', page.toString());
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== null && value !== undefined && value !== '') {
            params.append(key, String(value));
          }
        });
        return `units?${params.toString()}`;
      },
      providesTags: (result) =>
        result
          ? [...result.data.map(({ id }) => ({ type: 'Units' as const, id })), { type: 'Units', id: 'LIST' }]
          : [{ type: 'Units', id: 'LIST' }],
    }),
    getUnitById: builder.query<Unit, number>({
      query: (id) => `units/${id}`,
      providesTags: (result, error, id) => [{ type: 'Units', id }],
    }),
    getUnitFormOptions: builder.query<UnitFormOptions, void>({
      query: () => 'units/create',
    }),
    createUnit: builder.mutation<Unit, FormData>({
      query: (newUnitData) => ({
        url: 'units',
        method: 'POST',
        body: newUnitData,
      }),
      invalidatesTags: [{ type: 'Units', id: 'LIST' }],
    }),
    updateUnit: builder.mutation<Unit, { id: number; data: FormData }>({
      query: ({ id, data }) => ({
        url: `units/${id}`,
        method: 'POST', // Laravel utilise POST avec _method=PUT pour les requêtes FormData
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Units', id }, { type: 'Units', id: 'LIST' }],
    }),
    deleteUnits: builder.mutation<void, number[]>({
      query: (ids) => ({
        url: 'units/bulk-delete',
        method: 'POST', // Utilise POST pour la suppression en masse
        body: { unit_ids: ids },
      }),
      invalidatesTags: [{ type: 'Units', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetUnitsQuery,
  useGetUnitByIdQuery,
  useGetUnitFormOptionsQuery,
  useCreateUnitMutation, // <-- Ensure this is exported
  useUpdateUnitMutation, // <-- Ensure this is exported
  useDeleteUnitsMutation, // <-- Ensure this is exported
} = unitApi;
