// src/features/api/categories.ts

import { baseApi } from "./api";

export const categoriesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // 1. MODIFIED: To support server-side pagination and searching
    getCategories: builder.query<any, { page: number; perPage: number; search?: string }>({
      query: ({ page, perPage, search }) => {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: perPage.toString(),
        });
        if (search) {
          params.append('search', search);
        }
        return `categories?${params.toString()}`;
      },
      // Provides a general list tag and a specific tag for each item
      providesTags: (result) =>
        result && result.data
          ? [
              ...result.data.map(({ category_id }) => ({ type: 'Category' as const, id: category_id })),
              { type: 'Category', id: 'LIST' },
            ]
          : [{ type: 'Category', id: 'LIST' }],
    }),

    showCategory: builder.query<any, string>({
      query: (id) => `categories/${id}`,
      // Provides a tag for this specific category by its ID
      providesTags: (result, error, id) => [{ type: 'Category', id }],
    }),

    addCategory: builder.mutation<any, any>({
      query: (newCategory) => ({
        url: '/categories',
        method: 'POST',
        body: newCategory,
      }),
      // Invalidates the general list to trigger a refetch
      invalidatesTags: [{ type: 'Category', id: 'LIST' }],
    }),

    // 2. FIXED: To correctly handle the payload from the component
    updateCategory: builder.mutation<any, { id: string; name: string; description: string; status: number }>({
      // Destructure `id` for the URL and the rest of the payload for the body
      query: ({ id, ...body }) => ({
        url: `/categories/${id}`,
        method: 'PUT',
        body,
      }),
      // Invalidates the specific category's tag to refetch its details
      invalidatesTags: (result, error, { id }) => [{ type: 'Category', id }],
    }),

    deleteCategories: builder.mutation<any, { ids: string[] }>({
      query: ({ ids }) => ({
        url: '/categories/bulk-delete',
        method: 'POST',
        body: { ids },
      }),
      invalidatesTags: [{ type: 'Category', id: 'LIST' }],
    }),

    deleteCategory: builder.mutation<any, string>({
      query: (id) => ({
        url: `/categories/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Category', id }, { type: 'Category', id: 'LIST' }],
    }),
  }),
});

// 3. FIXED: Removed duplicate export
export const {
  useGetCategoriesQuery,
  useAddCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoriesMutation,
  useDeleteCategoryMutation,
  useShowCategoryQuery
} = categoriesApi;