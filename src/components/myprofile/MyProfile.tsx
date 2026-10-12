"use client";
import {
  useDeleteAccountMutation,
  useGetMyProfileQuery,
} from "@/redux/api/userApi";
import { format } from "date-fns";
import Cookies from "js-cookie";
import {
  Calendar,
  Edit2,
  Lock,
  LogOut,
  MapPin,
  Phone,
  Shield,
  Trash2,
  User,
  UserPlus,
  Coins,
  Heart,
  Users,
  Globe,
  Briefcase,
  Book,
  Languages,
  Ruler,
  Baby,
  Home,
  Award,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import Swal from "sweetalert2";
import { ChangePasswordModal } from "./ChangePasswordModal";
import { EditProfileModal } from "./EditProfileModal";
import { FriendRequestsModal } from "./FriendRequestsModal";
import { UserProfile } from "@/types/UserProfileTypes";
import { useRouter } from "next/navigation";

interface UserApiResponse {
  success: boolean;
  message: string;
  result: UserProfile;
}

interface InterestItem {
  icon: string;
  label: string;
}

export default function MyProfile() {
  const { data: myProfileData, isLoading } = useGetMyProfileQuery({});
  const [deleteAccountFn, { isLoading: isDeleting }] =
    useDeleteAccountMutation();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] =
    useState(false);
  const [isFriendRequestsModalOpen, setIsFriendRequestsModalOpen] = useState(false);
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050505] text-white font-sans pb-10 flex items-center justify-center">
        <div className="text-white">Loading profile...</div>
      </div>
    );
  }

  const user = (myProfileData as UserApiResponse | undefined)?.result;
  if (!user) {
    return (
      <div className="min-h-screen bg-[#050505] text-white font-sans pb-10 flex items-center justify-center">
        <div className="text-white">Loading profile...</div>
      </div>
    );
  }

  const calculateAge = (dob: string): number => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  const formatDate = (dateString: string): string => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy");
    } catch (error) {
      return "Invalid date";
    }
  };

  const galleryImages: string[] = [
    user.galleryImage1,
    user.galleryImage2,
    user.galleryImage3,
    user.galleryImage4,
    user.galleryImage5,
    user.galleryImage6,
  ].filter((img): img is string => img !== null && typeof img === "string");

  const interests: InterestItem[] = Array.isArray(user.interests)
    ? user.interests.map((interest: string) => {
      const match = interest.match(/^(\p{Emoji})\s*(.+)$/u);
      if (match) {
        return {
          icon: match[1],
          label: match[2],
        };
      }
      return {
        icon: "🌟",
        label: interest,
      };
    })
    : [];

  const viceEmojiMap: Record<string, string> = {
    Alcohol: "🍺",
    Smoking: "🚬",
    Marijuana: "🌿",
    Drugs: "💊",
  };

  const parsedVices = Array.isArray(user.vices)
    ? (user.vices as Record<string, string>[]).map((entry) => {
      const label = Object.keys(entry)[0];
      const value = entry[label];
      return { label, value, emoji: viceEmojiMap[label] ?? "🔹" };
    })
    : [];

  const handleDeleteAccount = async () => {
    const result = await Swal.fire({
      title: "Delete Account?",
      html: `
        <div class="text-left">
          <p class="text-red-500 mb-2">Are you sure you want to delete your account?</p>
          <p class="text-sm text-gray-600 mb-4">This action cannot be undone. All your data will be permanently removed.</p>
          <div class="bg-red-50 p-3 rounded border border-red-200">
            <p class="text-sm text-red-700 font-semibold mb-1">Warning:</p>
            <ul class="text-xs text-red-600 list-disc pl-4 space-y-1">
              <li>Your profile will be permanently deleted</li>
              <li>All matches and messages will be lost</li>
              <li>You will be logged out immediately</li>
              <li>This action cannot be reversed</li>
            </ul>
          </div>
        </div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, keep my account",
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        try {
          const response = await deleteAccountFn({}).unwrap();
          return response;
        } catch (error: any) {
          Swal.showValidationMessage(
            `Error: ${error?.data?.message || "Failed to delete account"}`,
          );
          return false;
        }
      },
      allowOutsideClick: () => !Swal.isLoading(),
    });

    if (result.isConfirmed) {
      if (result.value?.success) {
        Cookies.remove("accessToken");

        await Swal.fire({
          title: "Account Deleted!",
          text: "Your account has been successfully deleted.",
          icon: "success",
          confirmButtonColor: "#3085d6",
          confirmButtonText: "Go to Homepage",
        });

        window.location.href = "/signup";
      } else {
        Swal.fire(
          "Error!",
          "There was an error deleting your account. Please try again later.",
          "error",
        );
      }
    }
  };

  const handleLogout = () => {
    Swal.fire({
      title: "Logout?",
      text: "Are you sure you want to logout?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, logout",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        Cookies.remove("accessToken");
        window.location.href = "/login";
      }
    });
  };

  const handleBuyTokens = () => {
    router.push("/buy-tokens");
  };

  return (
    <div className="relative min-h-screen w-full bg-black font-sans overflow-x-hidden pb-10">
      <div
        className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,#8B1A00,transparent_60%),radial-gradient(ellipse_at_bottom,#0A0000,#000)]"
        style={{ zIndex: 0 }}
      />

      <div className="max-w-5xl mx-auto px-4 pt-24 relative z-10">
        {/* Profile Image */}
        <div className="-mt-24 relative z-10 flex flex-col items-start">
          <div className="w-32 h-32 rounded-full border-4 border-amber-400/50 overflow-hidden shadow-[0_0_20px_rgba(251,191,36,0.3)] mb-4 bg-[#1a1a1a]">
            <Image
              width={128}
              height={128}
              src={
                user.profileImage ||
                "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop"
              }
              alt={user.fullName?.split(" ")[0]}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex items-center justify-between w-full mb-6">
            <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-yellow-400 to-orange-600 tracking-widest uppercase">
              {user.fullName?.split(" ")[0]}
            </h1>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsFriendRequestsModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 rounded-full text-sm font-semibold transition-colors border border-amber-500/20 whitespace-nowrap"
              >
                <UserPlus className="w-4 h-4" />
                <span className="hidden sm:inline">Friend Requests</span>
              </button>
              <button
                onClick={handleBuyTokens}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-300 hover:to-orange-400 text-black rounded-full text-sm font-semibold transition-all shadow-[0_0_15px_rgba(251,191,36,0.3)] hover:shadow-[0_0_25px_rgba(251,191,36,0.5)] whitespace-nowrap cursor-pointer"
              >
                <Coins className="w-4 h-4" />
                <span className="hidden sm:inline">Buy Tokens</span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-center gap-12 mb-8 text-center">
            <div>
              <div className="text-xl font-bold">{user.friendsCount || 0}</div>
              <div className="text-gray-400 text-sm">Friends</div>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div>
              <div className="text-xl font-bold">{user.matchedCount || 0}</div>
              <div className="text-gray-400 text-sm">Matched Me</div>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div>
              <div className="text-xl font-bold">{user.token || 0}</div>
              <div className="text-gray-400 text-sm">Tokens</div>
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="w-full space-y-4 mt-6">
          {/* Bio */}
          {user.bio && user.visibleBio && (
            <div className="bg-[#1a1a1a] rounded-xl border border-white/10 overflow-hidden">
              <div className="px-5 py-4 font-bold text-white text-lg border-b border-white/10">
                Bio
              </div>
              <div className="p-5 text-gray-300 text-sm leading-relaxed">
                {user.bio}
              </div>
            </div>
          )}

          {/* Interests */}
          {interests.length > 0 && (
            <div className="bg-[#1a1a1a] rounded-xl border border-white/10 overflow-hidden">
              <div className="px-5 py-4 font-bold text-white text-lg border-b border-white/10">
                Interests
              </div>
              <div className="p-5 flex flex-wrap gap-2">
                {interests.map((interest: InterestItem, index: number) => (
                  <span
                    key={index}
                    className="bg-gray-800/60 hover:bg-gray-700/60 text-gray-300 px-4 py-2 rounded-full text-sm flex items-center gap-2 transition-colors border border-white/10"
                  >
                    <span>{interest.icon}</span>
                    <span className="capitalize">{interest.label}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Vices */}
          {parsedVices.length > 0 && user.visibleVices && (
            <div className="bg-[#1a1a1a] rounded-xl border border-white/10 overflow-hidden">
              <div className="px-5 py-4 font-bold text-white text-lg border-b border-white/10">
                Vices
              </div>
              <div className="p-5 flex flex-wrap gap-3">
                {parsedVices.map(({ label, value, emoji }, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 px-4 py-2 rounded-full border text-sm
                      border-amber-500/30 bg-amber-500/10 text-amber-200"
                  >
                    <span>{emoji}</span>
                    <span className="font-medium">{label}:</span>
                    <span
                      className={`font-semibold ${value === "Yes"
                        ? "text-orange-400"
                        : value === "No"
                          ? "text-emerald-400"
                          : "text-amber-300"
                        }`}
                    >
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Gallery */}
          {galleryImages.length > 0 && (
            <div className="bg-[#1a1a1a] rounded-xl border border-white/10 overflow-hidden">
              <div className="px-5 py-4 font-bold text-white text-lg border-b border-white/10">
                Gallery
              </div>
              <div className="p-5 grid grid-cols-3 gap-3">
                {galleryImages.map((pic: string, index: number) => (
                  <div
                    key={index}
                    className="aspect-[3/4] rounded-xl overflow-hidden cursor-pointer"
                  >
                    <img
                      src={pic}
                      alt={`Gallery ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=500&fit=crop";
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Information - Only show fields that are visible */}
          {(user.gender || (user.address && user.visibleAddress) || (user.dob && user.visibleDob) || (user.profession && user.visibleProfession) || (user.religiousBeliefs && user.visibleReligiousBeliefs) || (user.politics && user.visiblePolitics) || (user.languages && user.visibleLanguages) || (user.height && user.visibleHeight) || (user.myEthnicity && user.visibleMyEthnicity) || (user.myChildren && user.visibleMyChildren) || (user.familyPlans && user.visibleFamilyPlans)) && (
            <div className="bg-[#1a1a1a] rounded-xl border border-white/10 overflow-hidden">
              <div className="px-5 py-4 font-bold text-white text-lg border-b border-white/10">
                Information
              </div>
              <div className="flex flex-col divide-y divide-white/10">
                {user.gender && user.visibleGender && (
                  <div className="px-5 py-4 text-sm text-gray-300 flex items-center gap-3">
                    <User className="w-4 h-4" /> {user.gender}
                  </div>
                )}
                {user.address && user.visibleAddress && (
                  <div className="px-5 py-4 text-sm text-gray-300 flex items-center gap-3">
                    <MapPin className="w-4 h-4" /> {user.address}
                  </div>
                )}
                {user.dob && user.visibleDob && (
                  <div className="px-5 py-4 text-sm text-gray-300 flex items-center gap-3">
                    <Calendar className="w-4 h-4" /> {formatDate(user.dob)} (
                    {calculateAge(user.dob)} years)
                  </div>
                )}
                {user.profession && user.visibleProfession && (
                  <div className="px-5 py-4 text-sm text-gray-300 flex items-center gap-3">
                    <Briefcase className="w-4 h-4" /> {user.profession}
                  </div>
                )}
                {user.religiousBeliefs && user.visibleReligiousBeliefs && (
                  <div className="px-5 py-4 text-sm text-gray-300 flex items-center gap-3 capitalize">
                    <Book className="w-4 h-4" /> {user.religiousBeliefs}
                  </div>
                )}
                {user.politics && user.visiblePolitics && (
                  <div className="px-5 py-4 text-sm text-gray-300 flex items-center gap-3 capitalize">
                    <Award className="w-4 h-4" /> {user.politics}
                  </div>
                )}
                {user.languages && user.visibleLanguages && (
                  <div className="px-5 py-4 text-sm text-gray-300 flex items-center gap-3">
                    <Languages className="w-4 h-4" /> {user.languages}
                  </div>
                )}
                {user.height && user.visibleHeight && (
                  <div className="px-5 py-4 text-sm text-gray-300 flex items-center gap-3">
                    <Ruler className="w-4 h-4" /> {user.height} cm
                  </div>
                )}
                {user.myEthnicity && user.visibleMyEthnicity && (
                  <div className="px-5 py-4 text-sm text-gray-300 flex items-center gap-3 capitalize">
                    <Globe className="w-4 h-4" /> {user.myEthnicity}
                  </div>
                )}
                {user.myChildren && user.visibleMyChildren && (
                  <div className="px-5 py-4 text-sm text-gray-300 flex items-center gap-3 capitalize">
                    <Baby className="w-4 h-4" /> {user.myChildren.replace("-", " ")}
                  </div>
                )}
                {user.familyPlans && user.visibleFamilyPlans && (
                  <div className="px-5 py-4 text-sm text-gray-300 flex items-center gap-3 capitalize">
                    <Home className="w-4 h-4" /> {user.familyPlans}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Dating Preferences */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {user.interestedIn && (
              <div className="bg-[#1a1a1a] rounded-xl border border-white/10 overflow-hidden">
                <div className="px-5 py-4 font-bold text-white text-lg border-b border-white/10 flex items-center gap-2">
                  <Heart className="w-4 h-4" /> Looking For
                </div>
                <div className="p-5 text-gray-300 text-sm capitalize">
                  {user.interestedIn}
                </div>
              </div>
            )}

            {user.relationship && (
              <div className="bg-[#1a1a1a] rounded-xl border border-white/10 overflow-hidden">
                <div className="px-5 py-4 font-bold text-white text-lg border-b border-white/10 flex items-center gap-2">
                  <Users className="w-4 h-4" /> Relationship Status
                </div>
                <div className="p-5 text-gray-300 text-sm capitalize">
                  {user.relationship}
                </div>
              </div>
            )}

            {user.intention && user.visibleIntention && (
              <div className="bg-[#1a1a1a] rounded-xl border border-white/10 overflow-hidden">
                <div className="px-5 py-4 font-bold text-white text-lg border-b border-white/10 flex items-center gap-2">
                  <Award className="w-4 h-4" /> Intention
                </div>
                <div className="p-5 text-gray-300 text-sm capitalize">
                  {user.intention.replace("-", " ")}
                </div>
              </div>
            )}

            {user.ethinicity && user.ethinicity.length > 0 && (
              <div className="bg-[#1a1a1a] rounded-xl border border-white/10 overflow-hidden">
                <div className="px-5 py-4 font-bold text-white text-lg border-b border-white/10 flex items-center justify-between">
                  <span className="flex items-center gap-2"><Globe className="w-4 h-4" /> Preferred Ethnicities</span>
                  {user.isEthnicityBreak && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400">Break</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 p-5">
                  {user.ethinicity.map((eth: string, idx: number) => (
                    <span key={idx} className="px-3 py-1 bg-gray-800/60 rounded-full text-sm text-gray-300 capitalize border border-white/10">
                      {eth.replace("-", " ")}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {user.religion && user.religion.length > 0 && (
              <div className="bg-[#1a1a1a] rounded-xl border border-white/10 overflow-hidden">
                <div className="px-5 py-4 font-bold text-white text-lg border-b border-white/10 flex items-center justify-between">
                  <span className="flex items-center gap-2"><Book className="w-4 h-4" /> Preferred Religions</span>
                  {user.isReligionBreak && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400">Break</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 p-5">
                  {user.religion.map((rel: string, idx: number) => (
                    <span key={idx} className="px-3 py-1 bg-gray-800/60 rounded-full text-sm text-gray-300 capitalize border border-white/10">
                      {rel}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Settings / Actions */}
          <section className="bg-[#1a1a1a] rounded-2xl border border-amber-500/10">
            <div className="p-2">
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 text-sm"
              >
                <Edit2 className="w-5 h-5 text-gray-400" />
                Edit Profile
              </button>

              <div className="h-px bg-white/5 mx-3" />

              <button
                onClick={() => setIsChangePasswordModalOpen(true)}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 text-sm"
              >
                <Lock className="w-5 h-5 text-gray-400" />
                Change Password
              </button>

              <div className="h-px bg-white/5 mx-3" />

              <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 text-sm">
                <Shield className="w-5 h-5 text-gray-400" />
                Privacy
              </button>

              <div className="h-px bg-white/5 mx-3" />

              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 text-sm text-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-5 h-5" />
                {isDeleting ? "Deleting..." : "Delete Account"}
              </button>

              <div className="h-px bg-white/5 mx-3" />

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 text-sm text-red-500"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          </section>
        </div>
      </div>

      {user && (
        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          user={user}
        />
      )}
      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
      />
      <FriendRequestsModal
        isOpen={isFriendRequestsModalOpen}
        onClose={() => setIsFriendRequestsModalOpen(false)}
      />
    </div>
  );
}