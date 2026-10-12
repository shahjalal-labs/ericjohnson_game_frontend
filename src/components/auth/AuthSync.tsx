"use client";

import { useGoogleLoginMutation } from "@/redux/api/userApi";
import Cookies from "js-cookie";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const AuthSync = () => {
  const { data: session, status } = useSession();
  const [storeUser] = useGoogleLoginMutation();
  const router = useRouter();

  const [isStoringUser, setIsStoringUser] = useState(false);

  useEffect(() => {
    const syncUserToken = async () => {
      const isGoogleSignIn = localStorage.getItem("googleSignIn");

      const name = session?.user?.name ?? "";
      const [firstName, ...lastNameParts] = name.split(" ");
      const lastName = lastNameParts.join(" ");

      // Only sync if user clicked Google login
      if (status === "authenticated" && session?.user && isGoogleSignIn) {
        const existingToken = Cookies.get("accessToken");

        // Only proceed if no existing token
        if (!existingToken) {
          setIsStoringUser(true);
          try {
            const response = await storeUser({
              fullName: firstName + " " + lastName,
              email: session.user.email,
              fcmToken: Cookies.get("fcmToken") || "",
            }).unwrap();

            if (response?.success) {
              Cookies.set("accessToken", response?.result?.token, {
                sameSite: "Lax",   // important for Next.js
                // secure: false,      // only send over HTTPS
              });
              toast.success("Google login synced successfully!");

              // router.refresh() forces Next.js to re-sync cookie state
              // so prepareHeaders in baseApi sees the token immediately
              // without requiring a manual page refresh
              router.refresh();

              // Check isSetup and redirect accordingly
              const isSetup = response?.result?.user?.isSetup;
              if (isSetup === true) {
                router.push("/");
              } else {
                router.push("/flow");
              }
            } else {
              // Handle case where response doesn't have token
              toast.error("Failed to sync Google account!");
              // Stay on current page, don't redirect
            }
          } catch (error: any) {
            // Log the actual error for debugging
            console.error("Google sync error:", error);

            // Show user-friendly error message
            if (error?.data?.message) {
              toast.error(error.data.message);
            } else {
              toast.error("Failed to sync Google account!");
            }

            // DO NOT redirect - stay on current page
            // Remove the flag so user can try again or use other method
            localStorage.removeItem("googleSignIn");
          } finally {
            setIsStoringUser(false);
            // Remove flag even on success to prevent re-triggering
            localStorage.removeItem("googleSignIn");
          }
        } else {
          // Token already exists, check isSetup from localStorage or make an API call
          localStorage.removeItem("googleSignIn");

          // Option 1: If you have user data stored elsewhere
          // const userData = JSON.parse(localStorage.getItem("userData") || "{}");
          // if (userData?.isSetup) {
          //   router.push("/");
          // } else {
          //   router.push("/flow");
          // }

          // Option 2: Default redirect (you might want to fetch user data first)
          router.push("/flow");
        }
      }
    };

    syncUserToken();
  }, [status, session, storeUser, router]);

  return (
    <>
      {isStoringUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A0500]/80 backdrop-blur-xl">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-12 h-12 border-4 border-t-transparent border-amber-500 rounded-full animate-spin"></div>
            <p className="text-amber-100 text-lg font-medium animate-pulse">
              Syncing your account...
            </p>
            <p className="text-amber-100/60 text-sm">
              Please wait a moment while we get things ready
            </p>
          </div>
        </div>
      )}
    </>
  );
};