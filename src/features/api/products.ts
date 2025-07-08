import { baseApi } from "./api";

// 1. Updated interface to match your exact table columns
interface Product {
  id: number;
  product_id: string;
  name: string;
  description: string;
  status: number;
  created_at: string;
  updated_at: string;


  category_id: string;
  category_name: string;    
  product_type_id: number;    
  product_type_name: string;  
}

export const productsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query<any, { page: number; perPage: number; search?: string }>({
      query: ({ page, perPage, search }) => {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: perPage.toString(),
        });
        if (search) {
          params.append('search', search);
        }
        return `products?${params.toString()}`;
      },
      // 2. Updated to use `product_id` for tagging the cache
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ product_id }) => ({ type: 'Product' as const, id: product_id })),
              { type: 'Product', id: 'LIST' },
            ]
          : [{ type: 'Product', id: 'LIST' }],
    }),

    showProduct: builder.query<any, string>({
      query: (productId) => `products/${productId}`,
      providesTags: (result, error, productId) => [{ type: 'Product', id: productId }],
    }),

    addProduct: builder.mutation<Product, Partial<Product>>({
      query: (newProduct) => ({
        url: '/products',
        method: 'POST',
        body: newProduct,
      }),
      invalidatesTags: [{ type: 'Product', id: 'LIST' }],
    }),

    // 3. Updated mutation to use `product_id` for the URL
    updateProduct: builder.mutation<Product, Partial<Product> & { product_id: string }>({
      query: ({ product_id, ...body }) => ({
        url: `/products/${product_id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { product_id }) => [{ type: 'Product', id: product_id }],
    }),

    deleteProducts: builder.mutation<{ success: boolean; ids: string[] }, { ids: string[] }>({
      query: ({ ids }) => ({
        url: '/products/bulk-delete',
        method: 'POST',
        body: { ids },
      }),
      invalidatesTags: [{ type: 'Product', id: 'LIST' }],
    }),

    deleteProduct: builder.mutation<{ success: boolean; id: string }, string>({
      query: (productId) => ({
        url: `/products/${productId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, productId) => [{ type: 'Product', id: productId }],
    }),
  }),
});

// Export the new product-related hooks
export const {
  useGetProductsQuery,
  useShowProductQuery,
  useLazyShowProductQuery,
  useAddProductMutation,
  useUpdateProductMutation,
  useDeleteProductsMutation,
  useDeleteProductMutation,
} = productsApi;