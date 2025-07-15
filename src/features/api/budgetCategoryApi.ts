import { baseApi } from "./api";

export const budgetCategoryApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getBudgetCategories: builder.query<any, { page?: number; per_page?: number }>({
            query: ({ page = 1, per_page = 10 } = {}) => `/budget-categories?page=${page}&per_page=${per_page}`,
            providesTags: ["BudgetCategory"],
        }),
        addBudgetCategory: builder.mutation<any, any>({
            query: (newBudgetCategory) => ({
                url: "/budget-categories",
                method: "POST",
                body: newBudgetCategory,
            }),
            invalidatesTags: ["BudgetCategory"],
        }),
        updateBudgetCategory: builder.mutation<any, { id: number; body: any }>({
            query: ({ id, body }) => ({
                url: `/budget-categories/${id}`,
                method: "PUT",
                body,
            }),
            invalidatesTags: ["BudgetCategory"],
        }),
        getBudgetCategoryById: builder.query<any, number>({
            query: (id) => `/budget-categories/${id}`,
            providesTags: ["BudgetCategory"],
        }),
        deleteBudgetCategory: builder.mutation<any, number>({
            query: (id) => ({
                url: `/budget-categories/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["BudgetCategory"],
        }),
        bulkDeleteBudgetCategories: builder.mutation<any, number[]>({
            query: (ids) => ({
                url: `/budget-categories/bulk-delete`,
                method: "POST",
                body: { budget_category_ids: ids },
            }),
            invalidatesTags: ["BudgetCategory"],
        }),
    }),
    overrideExisting: false,
});

export const {
    useGetBudgetCategoriesQuery,
    useAddBudgetCategoryMutation,
    useUpdateBudgetCategoryMutation,
    useGetBudgetCategoryByIdQuery,
    useDeleteBudgetCategoryMutation,
    useBulkDeleteBudgetCategoriesMutation,
} = budgetCategoryApi;