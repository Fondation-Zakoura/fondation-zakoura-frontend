import { baseApi } from "./api";

export const budgetLineApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getBudgetLines: builder.query<any, void>({
            query: () => "/budget-lines",
            providesTags: ["BudgetLine"],
        }),
        getBudgetLineOptions: builder.query<any, void>({
            query: () => "/budget-lines/options",
            providesTags: ["BudgetLine"],
        }),
        addBudgetLine: builder.mutation<any, any>({
            query: (newBudgetLine) => ({
                url: "/budget-lines",
                method: "POST",
                body: newBudgetLine,
            }),
            invalidatesTags: ["BudgetLine"],
        }),
        updateBudgetLine: builder.mutation<any, { id: number; body: any }>({
            query: ({ id, body }) => ({
                url: `/budget-lines/${id}`,
                method: "PUT",
                body,
            }),
            invalidatesTags: ["BudgetLine"],
        }),
        getBudgetLineById: builder.query<any, number>({
            query: (id) => `/budget-lines/${id}`,
            providesTags: ["BudgetLine"],
        }),
        deleteBudgetLine: builder.mutation<any, number>({
            query: (id) => ({
                url: `/budget-lines/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["BudgetLine"],
        }),
        bulkDeleteBudgetLines: builder.mutation<any, number[]>({
            query: (ids) => ({
                url: `/budget-lines/bulk-delete`,
                method: "POST",
                body: { ids},
            }),
            invalidatesTags: ["BudgetLine"],
        })
    }),
    overrideExisting: false,
});

export const {
    useGetBudgetLinesQuery,
    useAddBudgetLineMutation,
    useUpdateBudgetLineMutation,
    useGetBudgetLineByIdQuery,
    useDeleteBudgetLineMutation,
    useBulkDeleteBudgetLinesMutation,
    useGetBudgetLineOptionsQuery
} = budgetLineApi;