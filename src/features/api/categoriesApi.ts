import type { Category, CategoryDeleteParams, CategoryMutationParams, CategoryQueryParams, CategoryResponse } from "../types/categories";
import { baseApi } from "./api";

 
export const categoriesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // 🔹 Get paginated category list
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
 
    // 🔹 Get single category by ID
    showCategory: builder.query<{ data: Category }, number>({
      query: (id) => `categories/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Category", id }],
    }),
 
    // 🔹 Create new category
    addCategory: builder.mutation<Category, Partial<Category>>({
      query: (newCategory) => ({
        url: "categories",
        method: "POST",
        body: newCategory,
      }),
      invalidatesTags: [{ type: "Category", id: "LIST" }],
    }),
 
    // 🔹 Update category with separated mutation params
    updateCategory: builder.mutation<Category, CategoryMutationParams>({
      query: ({ category_id, ...body }) => ({
        url: `categories/${category_id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _error, { category_id }) => [
        { type: "Category", id: category_id },
        { type: "Category", id: "LIST" },
      ],
    }),
 
    // 🔹 Bulk delete categories
    deleteCategories: builder.mutation<{ success: boolean; ids: number[] }, CategoryDeleteParams>({
      query: ({ ids }) => ({
        url: "categories/bulk-delete",
        method: "POST",
        body: { ids },
      }),
      invalidatesTags: [{ type: "Category", id: "LIST" }],
    }),
 
    // 🔹 Delete single category
    deleteCategory: builder.mutation<{ success: boolean; id: number }, number>({
      query: (id) => ({
        url: `categories/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Category", id },
        { type: "Category", id: "LIST" },
      ],
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
 