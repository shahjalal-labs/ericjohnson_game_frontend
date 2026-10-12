import baseApi from "../baseApi";

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    signIn: builder.mutation({
      query: (body) => ({
        url: "/auth/login",
        method: "POST",
        body,
      }),
      invalidatesTags: ["User"],
    }),
    signUp: builder.mutation({
      query: (payload) => ({
        url: "/auth/signup",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["User"],
    }),

    signUpverifyEmail: builder.mutation({
      query: (body) => ({
        url: "/auth/verify-signup-otp",
        method: "POST",
        body,
      }),
    }),

    verifyEmail: builder.mutation({
      query: (body) => ({
        url: "/auth/verify-otp",
        method: "POST",
        body,
      }),
    }),
    resendCode: builder.mutation({
      query: (body) => ({
        url: "/auth/send-otp",
        method: "POST",
        body,
      }),
    }),
    forgetPassword: builder.mutation({
      query: (body) => ({
        url: "/auth/forgot-password",
        method: "POST",
        body,
      }),
    }),

    logout: builder.mutation({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
    }),
    resetPassword: builder.mutation({
      query: (payload) => ({
        url: `/auth/reset-password`,
        method: "POST",
        body: payload,
      }),
    }),

    googleLogin: builder.mutation({
      query: (payload) => ({
        url: `/auth/social-login`,
        method: "POST",
        body: payload,
      }),
    }),
  }),
  overrideExisting: true,
});

export const {
  useSignInMutation,
  useSignUpMutation,
  useLogoutMutation,
  useVerifyEmailMutation,
  useResendCodeMutation,
  useForgetPasswordMutation,
  useResetPasswordMutation,
  useGoogleLoginMutation,
  useSignUpverifyEmailMutation,
} = authApi;
