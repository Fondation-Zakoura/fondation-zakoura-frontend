import { baseApi } from "./api";
import type {
  Product,
  ProductQueryParams,
  ProductResponse,
  ProductMutationParams,
  ProductDeleteParams,
} from "@/types/products";
 
export const productsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // 🔹 Fetch paginated product list
    getProducts: builder.query<ProductResponse, ProductQueryParams>({
      query: ({ page, perPage, search, withTrashed }) => {
        const params = new URLSearchParams({
          page: page.toString(),
          per_page: perPage.toString(),
        });
        if (search) params.append("search", search);
        if (withTrashed) params.append("with_trashed", "true");
 
        return `products?${params.toString()}`;
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ product_id }) => ({
                type: "Product" as const,
                id: product_id,
              })),
              { type: "Product", id: "LIST" },
            ]
          : [{ type: "Product", id: "LIST" }],
    }),
 
    // 🔹 Fetch single product
    showProduct: builder.query<{ data: Product }, number>({
      query: (product_id) => `products/${product_id}`,
      providesTags: (_result, _error, product_id) => [{ type: "Product", id: product_id }],
    }),
 
    // 🔹 Add new product
    addProduct: builder.mutation<Product, Partial<Product>>({
      query: (newProduct) => ({
        url: "products",
        method: "POST",
        body: newProduct,
      }),
      invalidatesTags: [{ type: "Product", id: "LIST" }],
    }),
 
    // 🔹 Update product
    updateProduct: builder.mutation<Product, ProductMutationParams>({
      query: ({ product_id, ...body }) => ({
        url: `products/${product_id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _error, { product_id }) => [
        { type: "Product", id: product_id },
        { type: "Product", id: "LIST" },
      ],
    }),
 
    // 🔹 Delete multiple products
    deleteProducts: builder.mutation<{ success: boolean; ids: number[] }, ProductDeleteParams>({
      query: ({ ids }) => ({
        url: "products/bulk-delete",
        method: "POST",
        body: { ids },
      }),
      invalidatesTags: [{ type: "Product", id: "LIST" }],
    }),
 
    // 🔹 Delete single product
    deleteProduct: builder.mutation<{ success: boolean; id: number }, number>({
      query: (product_id) => ({
        url: `products/${product_id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, product_id) => [
        { type: "Product", id: product_id },
        { type: "Product", id: "LIST" },
      ],
    }),
  }),
});
 
export const {
  useGetProductsQuery,
  useShowProductQuery,
  useAddProductMutation,
  useUpdateProductMutation,
  useDeleteProductsMutation,
  useDeleteProductMutation,
} = productsApi;
 