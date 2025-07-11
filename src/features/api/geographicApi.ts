// src/features/api/geographicApi.ts

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Define a type for geographic options (matching your GeoOption interface)
interface GeoOption {
  id: number;
  name: string;
}

export const geographicApi = createApi({
  reducerPath: 'geographicApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:8000/api/geographic', // Base URL for geographic endpoints
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) headers.set('Authorization', `Bearer ${token}`);
      headers.set('Accept', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['Region', 'Province', 'Cercle', 'Commune', 'Douar'],
  endpoints: (builder) => ({
    getRegions: builder.query<GeoOption[], void>({
      query: () => '/regions',
      providesTags: ['Region'],
    }),
    // IMPORTANT: Changed parameter type to 'number | null' and added conditional logic
    getProvinces: builder.query<GeoOption[], number | null>({
      query: (regionId) => {
        if (regionId === null) {
          return '/provinces'; // Endpoint to fetch ALL provinces if no regionId is provided
        }
        return `/provinces/${regionId}`;
      },
      providesTags: (result, error, regionId) => [{ type: 'Province', id: regionId }],
    }),
    // IMPORTANT: Changed parameter type to 'number | null' and added conditional logic
    getCercles: builder.query<GeoOption[], number | null>({
      query: (provinceId) => {
        if (provinceId === null) {
          return '/cercles'; // Endpoint to fetch ALL cercles if no provinceId is provided
        }
        return `/cercles/${provinceId}`;
      },
      providesTags: (result, error, provinceId) => [{ type: 'Cercle', id: provinceId }],
    }),
    // IMPORTANT: Conditional logic added to handle 'null' cercleId
    getCommunes: builder.query<GeoOption[], number | null>({
      query: (cercleId) => {
        if (cercleId === null) {
          // You need to decide what your API does here:
          // 1. Return all communes: '/communes'
          // 2. Return an empty array (if communes *must* have a cercle): This would involve returning { data: [] } or a specific endpoint for no-cercle communes.
          // For now, I'll assume '/communes' returns all communes. Adjust if your API differs.
          return '/communes';
        }
        return `/communes/${cercleId}`;
      },
      providesTags: (result, error, cercleId) => [{ type: 'Commune', id: cercleId }],
    }),
    // IMPORTANT: Changed parameter type to 'number | null' and added conditional logic
    getDouars: builder.query<GeoOption[], number | null>({
      query: (communeId) => {
        if (communeId === null) {
          return '/douars'; // Endpoint to fetch ALL douars if no communeId is provided
        }
        return `/douars/${communeId}`;
      },
      providesTags: (result, error, communeId) => [{ type: 'Douar', id: communeId }],
    }),
    getUsers: builder.query<{ id: number; name: string; email: string }[], void>({
      query: () => '/users',
    }),
  }),
});

export const {
  useGetRegionsQuery,
  useGetProvincesQuery,
  useGetCerclesQuery,
  useGetCommunesQuery,
  useGetDouarsQuery,
  useGetUsersQuery,
} = geographicApi;