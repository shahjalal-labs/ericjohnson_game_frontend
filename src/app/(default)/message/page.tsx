"use client";

import { Message } from "@/components/messages/Messag";
import { useGetMyProfileQuery } from "@/redux/api/userApi";
import Cookies from "js-cookie";

export default function MessagesPage() {
  const token = Cookies.get("accessToken") || "";
  const { data, isLoading } = useGetMyProfileQuery({});

  const userId = data?.result?.id || "";

  console.log("🔍 MessagesPage - Profile data:", {
    userId,
    userIdType: typeof userId,
    isLoading,
    fullProfile: data?.result
  });

  // // Wait for userId to load
  // if (isLoading || !userId) {
  //   return (
  //     <div className="flex h-screen items-center justify-center">
  //       <div className="text-zinc-400">Loading profile...</div>
  //     </div>
  //   );
  // }

  return (
    <div className="relative flex h-screen overflow-hidden w-full bg-black font-sans">
      {/* Background gradients from StartGame/Home */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,#8B1A00,transparent_60%),radial-gradient(ellipse_at_bottom,#0A0000,#000)]" style={{ zIndex: 0 }} />

      <div className="flex flex-1 container mx-auto px-4 w-full h-full pb-20 relative z-10">
        <Message token={token} userId={userId} />
      </div>
    </div>
  );
}
