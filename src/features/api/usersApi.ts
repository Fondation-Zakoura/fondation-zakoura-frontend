import { baseApi } from './api'; // Adjust the path as per your project structure
import type{  UserApiResponse } from '@/types/users';

export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<UserApiResponse, void>({
      query: () => '/users',
    }),
  }),
});

export const { useGetUsersQuery } = usersApi;