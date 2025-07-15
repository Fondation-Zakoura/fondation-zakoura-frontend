import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:8000/api',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      headers.set("Accept", 'Application/json');
      return headers;
    },
  }),
  tagTypes: ["Category", "User",'BudgetLine','BudgetCategory'],
  endpoints: () => ({}),
});
