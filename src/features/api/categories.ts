import { baseApi } from "./api";

const categoryApi=baseApi.injectEndpoints({

    endpoints:(builder)=>({
        getCategories:builder.query({
            query:()=>"/categories"
        }),
        addCategory: builder.mutation({
            query: (newCategory) => ({
                url: '/categories',
                method: 'POST',
                body: newCategory,
            })
        })
        
    })
        
    
})
export const { useAddCategoryMutation } = categoryApi;