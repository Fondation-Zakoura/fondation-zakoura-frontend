import { baseApi } from "./api";
import { type Article, type ArticleListResponse, type ArticleMutationParams, type ArticleQueryParams, type BulkDeleteResponse, type DeleteResponse, type SingleArticleResponse } from "@/types/articles";
export const articlesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getArticles: builder.query<ArticleListResponse, ArticleQueryParams>({
      query: (params) => ({
        url: "/articles",
        method: "GET",
        params,
      }),
      providesTags: ["Articles"],
    }),

    showArticle: builder.query<SingleArticleResponse, number>({
      query: (id) => `/articles/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Articles", id }],
    }),

    createArticle: builder.mutation<SingleArticleResponse, Partial<Article>>({
      query: (body) => ({
        url: "/articles",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Articles"],
    }),

    updateArticle: builder.mutation<SingleArticleResponse, ArticleMutationParams>({
      query: ({ article_id, ...body }) => ({
        url: `/articles/${article_id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _error, { article_id }) => [
        "Articles",
        { type: "Articles", id: article_id },
      ],
    }),

    deleteArticle: builder.mutation<DeleteResponse, number>({
      query: (id) => ({
        url: `/articles/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Articles"],
    }),

    deleteArticles: builder.mutation<BulkDeleteResponse, { ids: number[] }>({
      query: ({ ids }) => ({
        url: `/articles/bulk-delete`,
        method: "POST",
        body: { ids },
      }),
      invalidatesTags: ["Articles"],
    }),
  }),
});

export const { useGetArticlesQuery, useShowArticleQuery, useCreateArticleMutation, useUpdateArticleMutation, useDeleteArticleMutation, useDeleteArticlesMutation } = articlesApi;