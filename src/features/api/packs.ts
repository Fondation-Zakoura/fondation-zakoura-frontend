import { baseApi } from "./api";
import type {
  Pack,
  PackQueryParams,
  PackResponse,
  SinglePackResponse,
  DeleteResponse,
  BulkDeleteResponse,
} from "@/types/packs";

export const packApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPacks: builder.query<PackResponse, PackQueryParams>({
      query: (params) => ({
        url: "/packs",
        method: "GET",
        params,
      }),
      providesTags: ["Packs"],
    }),

    showPack: builder.query<SinglePackResponse, number>({
      query: (id) => `/packs/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Packs", id }],
    }),

    createPack: builder.mutation<Pack, Partial<Pack>>({
      query: (body) => ({
        url: "/packs",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Packs"],
    }),

    updatePack: builder.mutation<Pack, { id: number } & Partial<Pack>>({
      query: ({ id, ...body }) => ({
        url: `/packs/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => ["Packs", { type: "Packs", id }],
    }),

    deletePack: builder.mutation<DeleteResponse, number>({
      query: (id) => ({
        url: `/packs/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Packs"],
    }),

    deletePacks: builder.mutation<BulkDeleteResponse, { ids: number[] }>({
      query: ({ ids }) => ({
        url: "/packs/bulk-delete",
        method: "POST",
        body: { ids },
      }),
      invalidatesTags: ["Packs"],
    }),
  }),
});
export const {
  useGetPacksQuery,
  useShowPackQuery,
  useCreatePackMutation,
  useUpdatePackMutation,
  useDeletePackMutation,
  useDeletePacksMutation,
} = packApi;