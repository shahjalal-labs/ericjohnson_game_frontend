import baseApi from "./baseApi";

const tokenApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    buyTokens: builder.mutation({
      query: (data) => ({
        url: `/users/buy-token`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["tokens", "User"],
    }),
    useToken: builder.mutation({
      query: () => ({
        url: `/users/use-token`,
        method: "POST",
      }),
      invalidatesTags: ["tokens", "User"],
    }),
  }),
  overrideExisting: true,
});

export const { useBuyTokensMutation, useUseTokenMutation } = tokenApi;
