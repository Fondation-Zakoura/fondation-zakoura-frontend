import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type{  UserApiResponse } from '@/types/users';

export const usersApi = createApi({
  reducerPath: 'usersApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_API_URL}`,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) headers.set('Authorization', `Bearer ${token}`);
      headers.set('Accept', 'application/json');
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getUsers: builder.query<UserApiResponse, void>({
      query: () => '/users',
    }),
  }),
});

export const { useGetUsersQuery } = usersApi;