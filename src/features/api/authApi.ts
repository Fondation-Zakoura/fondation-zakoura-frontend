import { baseApi } from "./api";


export const authApi=baseApi.injectEndpoints(
    {
        endpoints: (builder) => ({
    loginUser: builder.mutation({
      query: (credentials) => ({
        url: '/login',
        method: 'POST',
        body: credentials,
      }),
    }),
  }),
    }
)

export const { useLoginUserMutation } = authApi;