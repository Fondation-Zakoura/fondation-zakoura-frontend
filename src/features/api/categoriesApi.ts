// src/features/api/categoriesApi.ts

import { baseApi } from "./api";
import type {
  Category,
  CategoryDeleteParams,
  CategoryMutationParams,
  CategoryQueryParams,
  CategoryResponse,
} from "@/types/categories";

export const categoriesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCategories: builder.query<CategoryResponse, CategoryQueryParams>({
      query: ({ page, perPage, search, withTrashed }) => {
        const params = new URLSearchParams({
          page: page.toString(),
          per_page: perPage.toString(),
        });
        if (search) params.append("search", search);
        if (withTrashed) params.append("with_trashed", "true");

        return `categories?${params.toString()}`;
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ category_id }) => ({
                type: "Category" as const,
                id: category_id,
              })),
              { type: "Category", id: "LIST" },
            ]
          : [{ type: "Category", id: "LIST" }],
    }),

    showCategory: builder.query<Category, { id: number; withTrashed?: boolean }>({
      query: ({ id, withTrashed }) => {
        const params = new URLSearchParams();
        if (withTrashed) params.append("with_trashed", "true");

        return `/categories/${id}?${params.toString()}`;
      },
      providesTags: (result) =>
        result ? [{ type: "Category", id: result.category_id }] : [],
    }),

    addCategory: builder.mutation<Category, Omit<CategoryMutationParams, "category_id">>({
      query: (newCategory) => ({
        url: "/categories",
        method: "POST",
        body: newCategory,
      }),
      invalidatesTags: [{ type: "Category", id: "LIST" }],
    }),

    updateCategory: builder.mutation<Category, CategoryMutationParams>({
      query: ({ category_id, ...body }) => ({
        url: `/categories/${category_id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _error, { category_id }) => [
  { type: "Category", id: category_id },
  { type: "Category", id: "LIST" },
],
    }),

    deleteCategories: builder.mutation<void, CategoryDeleteParams>({
      query: ({ ids }) => ({
        url: "/categories/bulk-delete",
        method: "POST",
        body: { ids },
      }),
      invalidatesTags: [{ type: "Category", id: "LIST" }],
    }),

    deleteCategory: builder.mutation<void, number>({
      query: (id) => ({
        url: `/categories/${id}`,
        method: "DELETE",
      }),
     invalidatesTags: (_result, _error, id: number | undefined) =>
  id !== undefined
    ? [
        { type: "Category", id },
        { type: "Category", id: "LIST" },
      ]
    : [],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useShowCategoryQuery,
  useAddCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoriesMutation,
  useDeleteCategoryMutation,
} = categoriesApi;