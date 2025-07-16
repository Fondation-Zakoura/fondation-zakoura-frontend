// src/features/api/geographicApi.ts
// IMPORT THE GLOBAL baseApi HERE
import { baseApi } from './api'; // Adjust the path as per your project structure

// Define a type for geographic options (matching your GeoOption interface)
interface GeoOption {
  id: number;
  name: string;
}

// Use baseApi.injectEndpoints instead of createApi
export const geographicApi = baseApi.injectEndpoints({
  // No reducerPath, baseQuery, or tagTypes here.
  // These are handled by the global baseApi.
  endpoints: (builder) => ({
    getRegions: builder.query<GeoOption[], void>({
      query: () => 'geographic/regions', // Adjust path to include 'geographic/'
      providesTags: ['Region'],
    }),
    getProvinces: builder.query<GeoOption[], number | null>({
      query: (regionId) => {
        if (regionId === null) {
          // You need to decide if your API supports getting all provinces without a regionId
          // or if it should return an empty array or an error.
          // For consistency with other geographic endpoints, assuming /geographic/provinces returns all
          return 'geographic/provinces';
        }
        return `geographic/provinces/${regionId}`; // Adjust path to include 'geographic/'
      },
      // Prefix unused parameters with '_'
      providesTags: (_result, _error, regionId) => [
        { type: 'Province', id: regionId ?? 'LIST' } // Use 'LIST' or a specific ID for queries without a parent ID
      ],
    }),
    getCercles: builder.query<GeoOption[], number | null>({
      query: (provinceId) => {
        if (provinceId === null) {
          return 'geographic/cercles'; // Adjust path
        }
        return `geographic/cercles/${provinceId}`; // Adjust path
      },
      // Prefix unused parameters with '_'
      providesTags: (_result, _error, provinceId) => [
        { type: 'Cercle', id: provinceId ?? 'LIST' }
      ],
    }),
    getCommunes: builder.query<GeoOption[], number | null>({
      query: (cercleId) => {
        if (cercleId === null) {
          return 'geographic/communes'; // Adjust path
        }
        return `geographic/communes/${cercleId}`; // Adjust path
      },
      // Prefix unused parameters with '_'
      providesTags: (_result, _error, cercleId) => [
        { type: 'Commune', id: cercleId ?? 'LIST' }
      ],
    }),
    getDouars: builder.query<GeoOption[], number | null>({
      query: (communeId) => {
        if (communeId === null) {
          return 'geographic/douars'; // Adjust path
        }
        return `geographic/douars/${communeId}`; // Adjust path
      },
      // Prefix unused parameters with '_'
      providesTags: (_result, _error, communeId) => [
        { type: 'Douar', id: communeId ?? 'LIST' }
      ],
    }),
    getUsers: builder.query<{ id: number; name: string; email: string }[], void>({
      query: () => '/users', // This should likely be in usersApi.ts
    }),
  }),
});

export const {
  useGetRegionsQuery,
  useGetProvincesQuery,
  useGetCerclesQuery,
  useGetCommunesQuery,
  useGetDouarsQuery,
  useGetUsersQuery
} = geographicApi;