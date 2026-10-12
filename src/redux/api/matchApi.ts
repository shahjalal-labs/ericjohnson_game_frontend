import baseApi from "./baseApi";

const matchApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllMatches: builder.query({
      query: () => ({
        url: `/match/matched-me`,
        method: "GET",
      }),
      providesTags: ["User"],
    }),
  }),
  overrideExisting: true,
});

export const { useGetAllMatchesQuery } = matchApi;
