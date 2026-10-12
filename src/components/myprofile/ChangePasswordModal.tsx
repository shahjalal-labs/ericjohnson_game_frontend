"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useChangePasswordMutation } from "@/redux/api/userApi";
import { useState } from "react";
import { toast } from "sonner";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
  const [changePassword, { isLoading }] = useChangePasswordMutation();

  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    try {
      const payload = {
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword,
      };

      const res = await changePassword(payload).unwrap();
      if (res?.success) {
        toast.success("Password changed successfully!");
        setFormData({ oldPassword: "", newPassword: "", confirmPassword: "" });
        onClose();
      } else {
        toast.error(res?.message || "Failed to change password");
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "An error occurred");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="border-amber-500/30 bg-[#1a0500] text-white sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-amber-400 text-xl font-bold">Change Password</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <label className="text-sm text-amber-100/70">Current Password</label>
            <Input
              type="password"
              name="oldPassword"
              value={formData.oldPassword}
              onChange={handleChange}
              placeholder="Enter current password"
              required
              className="bg-black/50 border-amber-500/30 text-white placeholder:text-gray-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-amber-100/70">New Password</label>
            <Input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              placeholder="Enter new password"
              required
              className="bg-black/50 border-amber-500/30 text-white placeholder:text-gray-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-amber-100/70">Confirm New Password</label>
            <Input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm new password"
              required
              className="bg-black/50 border-amber-500/30 text-white placeholder:text-gray-500"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-amber-500/30 text-amber-100 hover:bg-amber-500/10"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-amber-500 hover:bg-amber-400 text-black font-semibold"
            >
              {isLoading ? "Saving..." : "Change Password"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
