// features/api/unitApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface Site {
  id: number;
  name: string;
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

export interface User {
  id: number;
  name: string;
}

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
  deleted_at?: string;

  site?: Site;
  educator?: User;
  creator?: User;
}

export type UnitFormData = Omit<
  Unit,
  'id' | 'unit_id' | 'created_at' | 'updated_at' | 'deleted_at' | 'site' | 'educator' | 'creator'
>;

export interface PaginatedUnitsResponse {
  current_page: number;
  data: Unit[];
  first_page_url: string | null;
  from: number;
  last_page: number;
  last_page_url: string | null;
  links: Array<{
    url: string | null;
    label: string;
    active: boolean;
  }>;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

export interface UnitFormOptions {
  sites: Site[];
  educators: User[];
  unit_types: Unit['type'][];
  unit_statuses: Unit['status'][];
}

export interface GetUnitsQueryParams {
  page?: number;
  per_page?: number;
  filters?: Record<string, string | string[]>;
  globalSearch?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export const unitApi = createApi({
  reducerPath: 'unitApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:8000/api/',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Units'],
  endpoints: (builder) => ({
    getUnits: builder.query<PaginatedUnitsResponse, GetUnitsQueryParams>({
      query: ({ page = 1, per_page = 15, filters = {}, globalSearch, sortBy, sortDirection }) => {
        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('per_page', per_page.toString());

        if (globalSearch) {
          params.append('search', globalSearch);
        }

        if (sortBy && sortDirection) {
          params.append('sort_by', sortBy);
          params.append('sort_direction', sortDirection);
        }

        Object.entries(filters).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            value.forEach((item) => params.append(`${key}[]`, String(item)));
          } else if (value !== null && value !== undefined && value !== '') {
            params.append(key, String(value));
          }
        });
        return `units?${params.toString()}`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'Units' as const, id })),
              { type: 'Units', id: 'LIST' },
            ]
          : [{ type: 'Units', id: 'LIST' }],
    }),

    getUnitById: builder.query<Unit, number>({
      query: (id) => `units/${id}`,
      providesTags: (_, __, id) => [{ type: 'Units', id }],
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
        method: 'POST', // Assumes _method workaround for PUT/PATCH
        body: data,
      }),
      invalidatesTags: (_, __, { id }) => [
        { type: 'Units', id },
        { type: 'Units', id: 'LIST' },
      ],
    }),

    deleteUnits: builder.mutation<void, number[]>({
      query: (ids) => ({
        url: 'units/bulk-delete',
        method: 'POST',
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
  useCreateUnitMutation,
  useUpdateUnitMutation,
  useDeleteUnitsMutation,
} = unitApi;
