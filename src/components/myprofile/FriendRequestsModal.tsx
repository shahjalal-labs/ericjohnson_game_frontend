"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useReceiveFriendRequestQuery,
  useAcceptFriendRequestMutation,
} from "@/redux/api/friendsApi";
import Image from "next/image";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";
import { useState } from "react";

interface FriendRequestsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FriendRequestsModal({ isOpen, onClose }: FriendRequestsModalProps) {
  const { data, isLoading } = useReceiveFriendRequestQuery(undefined, {
    skip: !isOpen,
  });
  const [acceptRequest] = useAcceptFriendRequestMutation();
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  const requests = data?.result?.requests || [];

  const handleAccept = async (requestId: string) => {
    try {
      setAcceptingId(requestId);
      const res = await acceptRequest(requestId).unwrap();
      if (res?.success) {
        toast.success("Friend request accepted!");
      } else {
        toast.error(res?.message || "Failed to accept request");
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "An error occurred");
    } finally {
      setAcceptingId(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="border-amber-500/30 bg-[#1a0500] text-white w-[95vw] sm:w-full sm:max-w-[450px] rounded-2xl sm:rounded-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-amber-400 text-xl font-bold flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Friend Requests
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          {isLoading ? (
            <div className="text-center text-gray-400 py-4">Loading requests...</div>
          ) : requests.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              No pending friend requests.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {requests.map((request: any) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-black/40 border border-amber-500/10"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden border border-amber-500/30 bg-[#1a1a1a]">
                      <Image
                        src={
                          request.user1?.profileImage ||
                          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop"
                        }
                        alt={request.user1?.fullName || "User"}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="font-semibold text-gray-200">
                      {request.user1?.fullName || "Unknown User"}
                    </div>
                  </div>
                  <Button
                    onClick={() => handleAccept(request.id)}
                    disabled={acceptingId === request.id}
                    className="bg-amber-500 hover:bg-amber-400 text-black font-semibold h-9 px-4 rounded-full text-sm min-w-[80px]"
                  >
                    {acceptingId === request.id ? "Accepting..." : "Accept"}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
