import baseApi from "../baseApi";

export const getMe = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // need to add types
    getMeProfile: builder.query({
      query: () => "/users/profile",
      providesTags: ["User"],
    }),

    fileUploading: builder.mutation({
      query: (payload) => ({
        url: "/messages/generate-url",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["User"],
    }),

    zegoCloud: builder.query({
      query: ({ userId, roomId }) => ({
        url: `/zego-token?userId=${userId}&roomId=${roomId}`,
        method: "GET",
      }),
    }),
  }),
  overrideExisting: true,
});

export const {
  useFileUploadingMutation,
  useZegoCloudQuery,
  useGetMeProfileQuery,
} = getMe;

