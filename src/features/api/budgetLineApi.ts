import { baseApi } from "./api";

export const budgetLineApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getBudgetLines: builder.query<any, { page?: number; perPage?: number; [key: string]: any }>({
            // Accepts any filter keys and sends them as query params
            query: (params = {}) => {
                const { page = 1, perPage = 10, ...filters } = params;
                const searchParams = new URLSearchParams({
                    page: String(page),
                    per_page: String(perPage),
                    ...Object.fromEntries(
                        Object.entries(filters)
                            .filter(([_, v]) => v !== undefined && v !== null && v !== "")
                            .map(([k, v]) => [k, Array.isArray(v) ? v.join(",") : String(v)])
                    )
                });
                return `/budget-lines?${searchParams.toString()}`;
            },
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
        }),
        restoreBudgetLine: builder.mutation<any, number>({
            query: (id) => ({
                url: `/budget-lines/${id}/restore`,
                method: "PUT",
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
    useGetBudgetLineOptionsQuery,
    useRestoreBudgetLineMutation
} = budgetLineApi;