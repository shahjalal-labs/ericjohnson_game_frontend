import baseApi from "./baseApi";

const friendsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyFriends: builder.query({
      query: () => ({
        url: `/friend/my-friends`,
        method: "GET",
      }),
      providesTags: ["User"],
    }),
    receiveFriendRequest: builder.query({
      query: () => ({
        url: `/friend/receive-requests`,
        method: "GET",
      }),
      providesTags: ["User"],
    }),
    acceptFriendRequest: builder.mutation({
      query: (requestId: string) => ({
        url: `/friend/accept-request/${requestId}`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }),
      invalidatesTags: ["User"],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetMyFriendsQuery,
  useReceiveFriendRequestQuery,
  useAcceptFriendRequestMutation,
} = friendsApi;
