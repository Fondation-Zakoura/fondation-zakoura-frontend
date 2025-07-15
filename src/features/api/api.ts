// features/api/api.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import.meta.env.VITE_API_URL;
 
export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      headers.set("Accept", 'Application/json');
      return headers;
    },
  }),
  tagTypes: ["Category", "User",'BudgetLine','BudgetCategory'],
  endpoints: () => ({}),
});