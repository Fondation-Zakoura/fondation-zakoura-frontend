import { baseApi } from "./api";

export const articlesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // List articles with optional filters
    getArticles: builder.query<
      {
        data: any[];
        pagination?: {
          total: number;
          perPage: number;
          currentPage: number;
        };
      },
      {
        page?: number;
        perPage?: number;
        name?: string;
        productId?: string;
        brand?: string;
        status?: string;
      }
    >({
      query: (params) => ({
        url: "/articles",
        method: "GET",
        params,
      }),
      providesTags: ["Articles"],
    }),

    // Get a single article by ID
    showArticle: builder.query<any, number>({
      query: (id) => `/articles/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Articles", id }],
    }),

    // Create new article
    createArticle: builder.mutation<any, Partial<any>>({
      query: (body) => ({
        url: "/articles",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Articles"],
    }),

    // Update an article
   updateArticle: builder.mutation<
  any,
  {
    id?: string;
    product_id: number;
    name: string;
    specifications?: string;
    brand?: string;
    reference_price?: number;
  }
>({
  query: ({ id, ...body }) => ({
    url: `/articles/${id}`,
    method: "PUT",
    body: body, // Important: body must be plain object
  }),
  invalidatesTags: (_result, _error, { id }) => [
    "Articles",
    { type: "Articles", id },
  ],
}),


    // Delete a single article
    deleteArticle: builder.mutation<any, string>({
      query: (id) => ({
        url: `/articles/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Articles"],
    }),

    // Bulk delete articles
    deleteArticles: builder.mutation<any, { ids: string[] }>({
      query: ({ids}) => ({
        url: `/articles/bulk-delete`,
        method: "POST",
        body:{ids}
      }),
      invalidatesTags: ["Articles"],
    }),
  }),
});

export const {
  useGetArticlesQuery,
  useShowArticleQuery,
  useCreateArticleMutation,
  useUpdateArticleMutation,
  useDeleteArticleMutation,
  useDeleteArticlesMutation,
} = articlesApi;
