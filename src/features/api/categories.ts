import { baseApi } from "./api";

export const categoriesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCategories: builder.query<any, void>({
      query: () => '/categories',
      providesTags: ['Category'],
    }),
    addCategory: builder.mutation<any, any>({
      query: (newCategory) => ({
        url: '/categories',
        method: 'POST',
        body: newCategory,
      }),
      invalidatesTags: ['Category'],
    }),
    updateCategory: builder.mutation<any, { code: string; body: any }>({
      query: ({ code, body }) => ({
        url: `/categories/${code}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Category'],
    }),
    deleteCategories: builder.mutation<any, { ids: string[] }>({
      query: ({ ids }) => ({
        url: '/categories/bulk-delete',
        method: 'POST',
        body: { ids },
      }),
      invalidatesTags: ['Category'],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useAddCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoriesMutation,
} = categoriesApi;
