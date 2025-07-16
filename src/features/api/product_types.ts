import { baseApi } from "./api";

interface ProductType {
  id: number;
  name: string;
  created_at: string;
}

export const productTypeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProductTypes: builder.query<{ data: ProductType[] }, void>({
      query: () => `product-types`,
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'ProductType' as const, id })),
              { type: 'ProductType', id: 'LIST' },
            ]
          : [{ type: 'ProductType', id: 'LIST' }],
    }),

   getProductTypeById: builder.query<{ data: ProductType }, number>({
  query: (id) => `product-types/${id}`,
}),


    addProductType: builder.mutation<ProductType, Partial<ProductType>>({
      query: (newProductType) => ({
        url: 'product-types',
        method: 'POST',
        body: newProductType,
      }),
      invalidatesTags: [{ type: 'ProductType', id: 'LIST' }],
    }),

    updateProductType: builder.mutation<
      ProductType,
      Partial<ProductType> & { id: number }
    >({
      query: ({ id, ...body }) => ({
        url: `product-types/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'ProductType', id }],
    }),

    deleteProductTypes: builder.mutation<{ success: boolean; ids: number[] }, { ids: number[] }>({
      query: ({ ids }) => ({
        url: 'product-types/bulk-delete',
        method: 'POST',
        body: { ids },
      }),
      invalidatesTags: [{ type: 'ProductType', id: 'LIST' }],
    }),

    deleteProductType: builder.mutation<{ success: boolean; id: number }, number>({
      query: (id) => ({
        url: `product-types/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'ProductType', id }],
    }),
  }),
});

export const {
  useGetProductTypesQuery,
  useGetProductTypeByIdQuery,
  useAddProductTypeMutation,
  useUpdateProductTypeMutation,
  useDeleteProductTypesMutation,
  useDeleteProductTypeMutation,
} = productTypeApi;
