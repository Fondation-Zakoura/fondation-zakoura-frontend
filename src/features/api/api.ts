// src/features/api/api.ts

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    // Make sure the baseUrl does NOT have a trailing slash
    baseUrl: 'http://localhost:8000/api', 
    
    prepareHeaders: (headers) => {
      // 1. Add the Accept header. This is the crucial fix.
      headers.set('Accept', 'application/json');

      const token = localStorage.getItem('token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Category', 'User','Articles','Packs','Product','ProductType'], 
  endpoints: () => ({}), 
});