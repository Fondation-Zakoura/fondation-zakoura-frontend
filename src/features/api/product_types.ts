import { baseApi } from "./api";
import type {
  ProductType,
  ProductTypeQueryParams,
  ProductTypeMutationParams,
  ProductTypeResponse,
} from "@/types/productTypes";
 
export const productTypeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // 🔹 Fetch all product types (paginated)
    getProductTypes: builder.query<ProductTypeResponse, ProductTypeQueryParams>({
      query: ({ page, perPage, search, withTrashed }) => {
        const params = new URLSearchParams({
          page: page.toString(),
          per_page: perPage.toString(),
        });
        if (search) params.append("search", search);
        if (withTrashed) params.append("with_trashed", "true");
 
        return `product-types?${params.toString()}`;
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: "ProductType" as const, id })),
              { type: "ProductType", id: "LIST" },
            ]
          : [{ type: "ProductType", id: "LIST" }],
    }),
 
    // 🔹 Fetch single product type by ID
    getProductTypeById: builder.query<{ data: ProductType }, number>({
      query: (id) => `product-types/${id}`,
      providesTags: (_result, _error, id) => [{ type: "ProductType", id }],
    }),
 
    // 🔹 Create new product type
    addProductType: builder.mutation<ProductType, Partial<ProductType>>({
      query: (newProductType) => ({
        url: "product-types",
        method: "POST",
        body: newProductType,
      }),
      invalidatesTags: [{ type: "ProductType", id: "LIST" }],
    }),
 
    // 🔹 Update product type
    updateProductType: builder.mutation<ProductType, ProductTypeMutationParams>({
      query: ({ product_type_id, ...body }) => ({
        url: `product-types/${product_type_id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _error, { product_type_id }) => [
        { type: "ProductType", id: product_type_id },
        { type: "ProductType", id: "LIST" },
      ],
    }),
 
    // 🔹 Bulk delete product types
    deleteProductTypes: builder.mutation<{ success: boolean; ids: number[] }, { ids: number[] }>({
      query: ({ ids }) => ({
        url: "product-types/bulk-delete",
        method: "POST",
        body: { ids },
      }),
      invalidatesTags: [{ type: "ProductType", id: "LIST" }],
    }),
 
    // 🔹 Delete single product type
    deleteProductType: builder.mutation<{ success: boolean; id: number }, number>({
      query: (id) => ({
        url: `product-types/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "ProductType", id },
        { type: "ProductType", id: "LIST" },
      ],
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