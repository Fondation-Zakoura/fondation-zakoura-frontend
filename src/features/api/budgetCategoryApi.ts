import { baseApi } from "./api";

export const budgetCategoryApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getBudgetCategories: builder.query<any, { page?: number; per_page?: number; type?: string; is_active?: string; label?: string; code?: string; budgetary_area?: string }>({
            query: (params = {}) => {
                const { page = 1, per_page = 10, ...filters } = params;
                const searchParams = new URLSearchParams({
                    page: String(page),
                    per_page: String(per_page),
                    ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== undefined && v !== '')),
                });
                return `/budget-categories?${searchParams.toString()}`;
            },
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
        restoreBudgetCategory: builder.mutation<any, number>({
            query: (id) => ({
                url: `/budget-categories/${id}/restore`,
                method: "PUT",
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
    useRestoreBudgetCategoryMutation,
} = budgetCategoryApi;