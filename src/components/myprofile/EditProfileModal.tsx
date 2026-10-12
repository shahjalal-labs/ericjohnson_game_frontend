"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/Textarea";
import { useUpdateProfileMutation } from "@/redux/api/userApi";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { X, Upload } from "lucide-react";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

const VICE_OPTIONS = ["Alcohol", "Smoking", "Marijuana", "Drugs"];
const RELATIONSHIP_OPTIONS = ["Single", "In Relationship", "Married", "Divorced", "Open", "Complicated"];
const GENDER_OPTIONS = ["Male", "Female", "Other"];
const INTENTION_OPTIONS = ["casual", "long-term", "marriage", "friendship"];
const ETHNICITY_OPTIONS = [
  "white", "black", "hispanic", "asian", "middle-eastern", 
  "native-american", "pacific-islander", "mixed", "other"
];
const RELIGION_OPTIONS = [
  "muslim", "christian", "hindu", "buddhist", "jewish", 
  "atheist", "agnostic", "spiritual", "catholic", "mormon", "other"
];

const HEIGHT_OPTIONS = [
  { value: "4-11", label: "4'11\"" },
  { value: "5-0", label: "5'0\"" },
  { value: "5-1", label: "5'1\"" },
  { value: "5-2", label: "5'2\"" },
  { value: "5-3", label: "5'3\"" },
  { value: "5-4", label: "5'4\"" },
  { value: "5-5", label: "5'5\"" },
  { value: "5-6", label: "5'6\"" },
  { value: "5-7", label: "5'7\"" },
  { value: "5-8", label: "5'8\"" },
  { value: "5-9", label: "5'9\"" },
  { value: "5-10", label: "5'10\"" },
  { value: "5-11", label: "5'11\"" },
  { value: "6-0", label: "6'0\"" },
  { value: "6-1", label: "6'1\"" },
  { value: "6-2", label: "6'2\"" },
  { value: "6-3", label: "6'3\"" },
  { value: "6-4", label: "6'4\"" },
  { value: "6-5", label: "6'5\"" },
  { value: "6-6", label: "6'6\"" },
  { value: "6-7", label: "6'7\"" },
  { value: "6-8", label: "6'8\"" },
  { value: "6-9", label: "6'9\"" },
  { value: "6-10", label: "6'10\"" },
  { value: "6-11", label: "6'11\"" },
  { value: "7-plus", label: "7'+" },
];

const INTERESTS_WITH_ICONS = [
  { value: "travel", label: "Travel", icon: "✈️" },
  { value: "shopping", label: "Shopping", icon: "🛍️" },
  { value: "astrology", label: "Astrology", icon: "⭐" },
  { value: "music", label: "Music", icon: "🎵" },
  { value: "yoga", label: "Yoga", icon: "🧘" },
  { value: "swimming", label: "Swimming", icon: "🏊" },
  { value: "running", label: "Running", icon: "🏃" },
  { value: "photography", label: "Photography", icon: "📷" },
  { value: "hiking", label: "Hiking", icon: "🥾" },
  { value: "wine", label: "Wine", icon: "🍷" },
  { value: "karaoke", label: "Karaoke", icon: "🎤" },
  { value: "sports", label: "Sports", icon: "⚽" },
  { value: "beer", label: "Beer", icon: "🍺" },
  { value: "board-games", label: "Board Games", icon: "🎲" },
  { value: "working-out", label: "Working Out", icon: "💪" },
  { value: "fashion", label: "Fashion", icon: "👗" },
  { value: "videogames", label: "Videogames", icon: "🎮" },
  { value: "dancing", label: "Dancing", icon: "💃" },
  { value: "coffee", label: "Coffee", icon: "☕" },
  { value: "instagram", label: "Instagram", icon: "📱" },
  { value: "media", label: "Media", icon: "📰" },
  { value: "politics", label: "Politics", icon: "🗳️" },
  { value: "art", label: "Art", icon: "🎨" },
  { value: "writing", label: "Writing", icon: "✍️" },
  { value: "cooking", label: "Cooking", icon: "🍳" },
  { value: "outdoors", label: "Outdoors", icon: "🌲" },
  { value: "tea", label: "Tea", icon: "🍵" },
  { value: "gardening", label: "Gardening", icon: "🌺" },
];

const formFields = [
  {
    id: "fullName",
    label: "Full Name",
    type: "input" as const,
    placeholder: "Type full name",
    required: true,
  },
  {
    id: "dob",
    label: "Date of Birth",
    type: "date" as const,
    placeholder: "Select your date of birth",
    required: true,
  },
  {
    id: "gender",
    label: "Gender",
    type: "select" as const,
    placeholder: "Select your gender",
    options: [
      { value: "Male", label: "Male" },
      { value: "Female", label: "Female" },
      { value: "Other", label: "Other" },
    ],
    required: true,
  },
  {
    id: "address",
    label: "Location",
    type: "input" as const,
    placeholder: "Type your location",
    required: true,
  },
  {
    id: "religiousBeliefs",
    label: "Religious Beliefs",
    type: "select" as const,
    placeholder: "Select religion",
    options: [
      { value: "christian", label: "Christian" },
      { value: "muslim", label: "Muslim" },
      { value: "hindu", label: "Hindu" },
      { value: "buddhist", label: "Buddhist" },
      { value: "atheist", label: "Atheist" },
      { value: "agnostic", label: "Agnostic" },
      { value: "spiritual", label: "Spiritual" },
      { value: "catholic", label: "Catholic" },
      { value: "mormon", label: "Mormon" },
      { value: "other", label: "Other" },
    ],
    required: true,
  },
  {
    id: "profession",
    label: "Profession",
    type: "input" as const,
    placeholder: "Enter your Profession",
    required: true,
  },
  {
    id: "politics",
    label: "Politics",
    type: "select" as const,
    placeholder: "Select politics stance",
    options: [
      { value: "liberal", label: "Liberal" },
      { value: "conservative", label: "Conservative" },
      { value: "moderate", label: "Moderate" },
      { value: "other", label: "Other" },
    ],
    required: true,
  },
  {
    id: "languages",
    label: "Language Spoken",
    type: "select" as const,
    placeholder: "Select language",
    options: [
      { value: "english", label: "English" },
      { value: "spanish", label: "Spanish" },
      { value: "french", label: "French" },
      { value: "portuguese", label: "Portuguese" },
      { value: "german", label: "German" },
      { value: "russian", label: "Russian" },
      { value: "chinese", label: "Chinese" },
      { value: "japanese", label: "Japanese" },
      { value: "italian", label: "Italian" },
      { value: "korean", label: "Korean" },
      { value: "arabic", label: "Arabic" },
      { value: "bengali", label: "Bengali" },
      { value: "hindi", label: "Hindi" },
      { value: "other", label: "Other" },
    ],
    required: true,
  },
  {
    id: "intention",
    label: "Dating Intentions",
    type: "select" as const,
    placeholder: "Select intents",
    options: [
      { value: "casual", label: "Casual Dating" },
      { value: "long-term", label: "Long Term" },
      { value: "marriage", label: "Marriage" },
      { value: "friendship", label: "Friendship" },
    ],
    required: true,
  },
  {
    id: "height",
    label: "Height",
    type: "select" as const,
    placeholder: "Select height",
    options: HEIGHT_OPTIONS,
    required: true,
  },
  {
    id: "myEthnicity",
    label: "Ethnicity",
    type: "select" as const,
    placeholder: "Select ethnicity",
    options: [
      { value: "white", label: "White" },
      { value: "black", label: "Black" },
      { value: "hispanic", label: "Hispanic" },
      { value: "asian", label: "Asian" },
      { value: "middle-eastern", label: "Middle Eastern" },
      { value: "native-american", label: "Native American" },
      { value: "pacific-islander", label: "Pacific Islander" },
      { value: "mixed", label: "Mixed" },
      { value: "other", label: "Other" },
    ],
    required: true,
  },
  {
    id: "myChildren",
    label: "Children",
    type: "select" as const,
    placeholder: "Select children status",
    options: [
      { value: "none", label: "None" },
      { value: "has-children", label: "Has Children" },
      { value: "no-children", label: "No Children" },
      { value: "prefer-not-to-say", label: "Prefer Not to Say" },
    ],
    required: true,
  },
  {
    id: "familyPlans",
    label: "Family Plans",
    type: "select" as const,
    placeholder: "Select family plans",
    options: [
      { value: "maybe", label: "Maybe" },
      { value: "yes", label: "Want children" },
      { value: "no", label: "Don't want children" },
      { value: "prefer-not-to-say", label: "Prefer Not to Say" },
    ],
    required: true,
  },
  {
    id: "bio",
    label: "Bio",
    type: "textarea" as const,
    placeholder: "Say something about you...",
    required: true,
  },
];

export function EditProfileModal({ isOpen, onClose, user }: EditProfileModalProps) {
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();

  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    gender: "",
    visibleGender: true,
    dob: "",
    visibleDob: true,
    profession: "",
    visibleProfession: true,
    bio: "",
    visibleBio: true,
    address: "",
    visibleAddress: true,
    religiousBeliefs: "",
    visibleReligiousBeliefs: true,
    politics: "",
    visiblePolitics: true,
    languages: "",
    visibleLanguages: true,
    intention: "",
    visibleIntention: true,
    height: "",
    visibleHeight: true,
    myEthnicity: "",
    visibleMyEthnicity: true,
    myChildren: "",
    visibleMyChildren: true,
    familyPlans: "",
    visibleFamilyPlans: true,
    vices: [] as { [key: string]: string }[],
    visibleVices: true,
    maxDistance: 50,
    interestedIn: "",
    minAge: 18,
    maxAge: 100,
    relationship: "",
    ethinicity: [] as string[],
    isEthnicityBreak: false,
    religion: [] as string[],
    isReligionBreak: false,
    interests: [] as string[],
  });

  // Fixed: Use undefined instead of null to avoid TypeScript errors
  const [galleryImages, setGalleryImages] = useState<(string | File | undefined)[]>([
    undefined, undefined, undefined, undefined, undefined, undefined
  ]);
  const [galleryImageFiles, setGalleryImageFiles] = useState<(File | undefined)[]>([
    undefined, undefined, undefined, undefined, undefined, undefined
  ]);

  // Convert height value to display format
  const getHeightDisplayValue = (heightValue: string | number) => {
    if (!heightValue) return "";
    if (typeof heightValue === 'number') {
      const heightInFeet = (heightValue / 30.48).toFixed(1);
      const feet = Math.floor(Number(heightInFeet));
      const inches = Math.round((Number(heightInFeet) - feet) * 12);
      const heightKey = `${feet}-${inches}`;
      const exists = HEIGHT_OPTIONS.some(opt => opt.value === heightKey);
      if (exists) {
        return heightKey;
      }
      return String(heightValue);
    }
    return heightValue;
  };

  useEffect(() => {
    if (user) {
      let parsedVices: { [key: string]: string }[] = [];
      if (Array.isArray(user.vices)) {
        parsedVices = user.vices.map((vice: any) => {
          if (typeof vice === 'object') {
            return vice;
          }
          return {};
        });
      }

      let parsedEthnicity: string[] = [];
      if (Array.isArray(user.ethinicity)) {
        parsedEthnicity = user.ethinicity;
      }

      let parsedReligion: string[] = [];
      if (Array.isArray(user.religion)) {
        parsedReligion = user.religion;
      }

      let parsedInterests: string[] = [];
      if (Array.isArray(user.interests)) {
        parsedInterests = user.interests;
      }

      const heightDisplay = getHeightDisplayValue(user.height);

      setFormData({
        fullName: user.fullName || "",
        phoneNumber: user.phoneNumber || "",
        gender: user.gender || "",
        visibleGender: user.visibleGender !== undefined ? user.visibleGender : true,
        dob: user.dob ? (user.dob.includes('T') ? user.dob.split('T')[0] : user.dob) : "",
        visibleDob: user.visibleDob !== undefined ? user.visibleDob : true,
        profession: user.profession || "",
        visibleProfession: user.visibleProfession !== undefined ? user.visibleProfession : true,
        bio: user.bio || "",
        visibleBio: user.visibleBio !== undefined ? user.visibleBio : true,
        address: user.address || "",
        visibleAddress: user.visibleAddress !== undefined ? user.visibleAddress : true,
        religiousBeliefs: user.religiousBeliefs || "",
        visibleReligiousBeliefs: user.visibleReligiousBeliefs !== undefined ? user.visibleReligiousBeliefs : true,
        politics: user.politics || "",
        visiblePolitics: user.visiblePolitics !== undefined ? user.visiblePolitics : true,
        languages: user.languages || "",
        visibleLanguages: user.visibleLanguages !== undefined ? user.visibleLanguages : true,
        intention: user.intention || "",
        visibleIntention: user.visibleIntention !== undefined ? user.visibleIntention : true,
        height: heightDisplay,
        visibleHeight: user.visibleHeight !== undefined ? user.visibleHeight : true,
        myEthnicity: user.myEthnicity || "",
        visibleMyEthnicity: user.visibleMyEthnicity !== undefined ? user.visibleMyEthnicity : true,
        myChildren: user.myChildren || "",
        visibleMyChildren: user.visibleMyChildren !== undefined ? user.visibleMyChildren : true,
        familyPlans: user.familyPlans || "",
        visibleFamilyPlans: user.visibleFamilyPlans !== undefined ? user.visibleFamilyPlans : true,
        vices: parsedVices.length > 0 ? parsedVices : VICE_OPTIONS.map(v => ({ [v]: "No" })),
        visibleVices: user.visibleVices !== undefined ? user.visibleVices : true,
        maxDistance: user.maxDistance || 50,
        interestedIn: user.interestedIn || "",
        minAge: user.minAge || 18,
        maxAge: user.maxAge || 100,
        relationship: user.relationship || "",
        ethinicity: parsedEthnicity,
        isEthnicityBreak: user.isEthnicityBreak || false,
        religion: parsedReligion,
        isReligionBreak: user.isReligionBreak || false,
        interests: parsedInterests,
      });

      // Fixed: Set gallery images with undefined instead of null
      const gallery = [
        user.galleryImage1,
        user.galleryImage2,
        user.galleryImage3,
        user.galleryImage4,
        user.galleryImage5,
        user.galleryImage6,
      ];
      setGalleryImages(gallery.map(img => img || undefined));
    }
  }, [user, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleViceChange = (viceName: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      vices: prev.vices.map(vice => {
        if (vice[viceName] !== undefined) {
          return { [viceName]: value };
        }
        return vice;
      }),
    }));
  };

  const handleArrayChange = (field: string, value: string, checked: boolean) => {
    setFormData((prev) => {
      const current = prev[field as keyof typeof formData] as string[];
      if (checked) {
        return { ...prev, [field]: [...current, value] };
      } else {
        return { ...prev, [field]: current.filter(item => item !== value) };
      }
    });
  };

  const handleGalleryImageChange = (index: number, file: File | null) => {
    if (file) {
      const newGalleryImages = [...galleryImages];
      newGalleryImages[index] = file;
      setGalleryImages(newGalleryImages);
      
      const newFiles = [...galleryImageFiles];
      newFiles[index] = file;
      setGalleryImageFiles(newFiles);
    }
  };

  const removeGalleryImage = (index: number) => {
    const newGalleryImages = [...galleryImages];
    newGalleryImages[index] = undefined;
    setGalleryImages(newGalleryImages);
    
    const newFiles = [...galleryImageFiles];
    newFiles[index] = undefined;
    setGalleryImageFiles(newFiles);
  };

  // Convert height from display format to number (cm)
  const convertHeightToCm = (heightValue: string): number => {
    if (!heightValue) return 0;
    
    if (!isNaN(Number(heightValue))) {
      return Number(heightValue);
    }
    
    const parts = heightValue.split('-');
    if (parts.length === 2) {
      const feet = parseInt(parts[0]);
      const inches = parseInt(parts[1]);
      if (!isNaN(feet) && !isNaN(inches)) {
        return Math.round((feet * 30.48) + (inches * 2.54));
      }
    }
    
    return 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const heightInCm = convertHeightToCm(formData.height);

      const payload: any = {
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        gender: formData.gender,
        visibleGender: formData.visibleGender,
        visibleDob: formData.visibleDob,
        profession: formData.profession,
        visibleProfession: formData.visibleProfession,
        bio: formData.bio,
        visibleBio: formData.visibleBio,
        address: formData.address,
        visibleAddress: formData.visibleAddress,
        religiousBeliefs: formData.religiousBeliefs,
        visibleReligiousBeliefs: formData.visibleReligiousBeliefs,
        politics: formData.politics,
        visiblePolitics: formData.visiblePolitics,
        languages: formData.languages,
        visibleLanguages: formData.visibleLanguages,
        intention: formData.intention,
        visibleIntention: formData.visibleIntention,
        height: heightInCm || undefined,
        visibleHeight: formData.visibleHeight,
        myEthnicity: formData.myEthnicity,
        visibleMyEthnicity: formData.visibleMyEthnicity,
        myChildren: formData.myChildren,
        visibleMyChildren: formData.visibleMyChildren,
        familyPlans: formData.familyPlans,
        visibleFamilyPlans: formData.visibleFamilyPlans,
        vices: formData.vices,
        visibleVices: formData.visibleVices,
        maxDistance: Number(formData.maxDistance),
        interestedIn: formData.interestedIn,
        minAge: Number(formData.minAge),
        maxAge: Number(formData.maxAge),
        relationship: formData.relationship,
        isEthnicityBreak: formData.isEthnicityBreak,
        isReligionBreak: formData.isReligionBreak,
      };

      if (formData.dob) {
        payload.dob = new Date(formData.dob).toISOString();
      }

      const hasFiles = galleryImageFiles.some(file => file !== undefined);
      
      if (hasFiles) {
        const formDataObj = new FormData();
        
        formDataObj.append('bodyData', JSON.stringify(payload));

        // Send arrays as separate JSON strings
        formDataObj.append('ethinicity', JSON.stringify(formData.ethinicity));
        formDataObj.append('religion', JSON.stringify(formData.religion));
        formDataObj.append('interests', JSON.stringify(formData.interests));

        galleryImageFiles.forEach((file, index) => {
          if (file) {
            formDataObj.append(`galleryImage${index + 1}`, file);
          }
        });

        const res = await updateProfile(formDataObj).unwrap();
        if (res?.success) {
          toast.success("Profile updated successfully!");
          onClose();
        } else {
          toast.error(res?.message || "Failed to update profile");
        }
      } else {
        const jsonPayload = {
          ...payload,
          ethinicity: formData.ethinicity,
          religion: formData.religion,
          interests: formData.interests,
        };
        
        const res = await updateProfile(jsonPayload).unwrap();
        if (res?.success) {
          toast.success("Profile updated successfully!");
          onClose();
        } else {
          toast.error(res?.message || "Failed to update profile");
        }
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "An error occurred");
    }
  };

  const renderField = (field: typeof formFields[0]) => {
    const value = formData[field.id as keyof typeof formData] as string;
    
    switch (field.type) {
      case 'input':
        return (
          <Input
            name={field.id}
            value={value}
            onChange={handleChange}
            placeholder={field.placeholder}
            className="bg-black/50 border-amber-500/30 text-white placeholder:text-gray-500"
          />
        );
      case 'date':
        return (
          <Input
            type="date"
            name={field.id}
            value={value}
            onChange={handleChange}
            className="bg-black/50 border-amber-500/30 text-white placeholder:text-gray-500"
          />
        );
      case 'select':
        return (
          <select
            name={field.id}
            value={value}
            onChange={handleChange}
            className="flex h-10 w-full rounded-md border bg-black/50 border-amber-500/30 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          >
            <option value="">{field.placeholder}</option>
            {field.options?.map((opt) => (
              <option key={opt.value} value={opt.value} className="text-black">
                {opt.label}
              </option>
            ))}
          </select>
        );
      case 'textarea':
        return (
          <Textarea
            name={field.id}
            value={value}
            onChange={handleChange}
            placeholder={field.placeholder}
            className="bg-black/50 border-amber-500/30 text-white placeholder:text-gray-500 min-h-[100px]"
          />
        );
      default:
        return null;
    }
  };

  const getVisibilityFieldId = (fieldId: string) => {
    const visibilityMap: Record<string, string> = {
      gender: 'visibleGender',
      dob: 'visibleDob',
      profession: 'visibleProfession',
      bio: 'visibleBio',
      address: 'visibleAddress',
      religiousBeliefs: 'visibleReligiousBeliefs',
      politics: 'visiblePolitics',
      languages: 'visibleLanguages',
      intention: 'visibleIntention',
      height: 'visibleHeight',
      myEthnicity: 'visibleMyEthnicity',
      myChildren: 'visibleMyChildren',
      familyPlans: 'visibleFamilyPlans',
    };
    return visibilityMap[fieldId];
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#1a0500] border border-amber-500/30 text-white max-w-[800px] w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-amber-400 text-2xl font-bold">Edit Profile</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-amber-400/80 text-sm font-semibold uppercase tracking-wider">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formFields.map((field) => {
                const visibilityId = getVisibilityFieldId(field.id);
                const isVisible = visibilityId ? formData[visibilityId as keyof typeof formData] as boolean : true;
                
                return (
                  <div key={field.id} className="space-y-2">
                    <label className="text-sm text-amber-100/70">
                      {field.label} {field.required && <span className="text-red-400">*</span>}
                    </label>
                    {renderField(field)}
                    {visibilityId && (
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="checkbox"
                          name={visibilityId}
                          checked={isVisible}
                          onChange={handleChange}
                          className="rounded border-amber-500/30 bg-black/50 text-amber-500 focus:ring-amber-500/50"
                        />
                        <label className="text-sm text-amber-100/60">Show on profile</label>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Phone Number */}
          <div className="space-y-4">
            <h3 className="text-amber-400/80 text-sm font-semibold uppercase tracking-wider">Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-amber-100/70">Phone Number</label>
                <Input
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="Phone Number"
                  className="bg-black/50 border-amber-500/30 text-white placeholder:text-gray-500"
                />
              </div>
            </div>
          </div>

          {/* Dating Preferences */}
          <div className="space-y-4">
            <h3 className="text-amber-400/80 text-sm font-semibold uppercase tracking-wider">Dating Preferences</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-amber-100/70">Looking For</label>
                <select
                  name="interestedIn"
                  value={formData.interestedIn}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border bg-black/50 border-amber-500/30 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                >
                  <option value="">Select</option>
                  {GENDER_OPTIONS.map(g => (
                    <option key={g} value={g} className="text-black">{g}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-amber-100/70">Relationship Status</label>
                <select
                  name="relationship"
                  value={formData.relationship}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border bg-black/50 border-amber-500/30 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                >
                  <option value="">Select</option>
                  {RELATIONSHIP_OPTIONS.map(r => (
                    <option key={r} value={r} className="text-black">{r}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-amber-100/70">Min Age</label>
                <Input
                  type="number"
                  name="minAge"
                  value={formData.minAge}
                  onChange={handleChange}
                  className="bg-black/50 border-amber-500/30 text-white placeholder:text-gray-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-amber-100/70">Max Age</label>
                <Input
                  type="number"
                  name="maxAge"
                  value={formData.maxAge}
                  onChange={handleChange}
                  className="bg-black/50 border-amber-500/30 text-white placeholder:text-gray-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-amber-100/70">Max Distance (km)</label>
                <Input
                  type="number"
                  name="maxDistance"
                  value={formData.maxDistance}
                  onChange={handleChange}
                  className="bg-black/50 border-amber-500/30 text-white placeholder:text-gray-500"
                />
              </div>
            </div>
          </div>

          {/* Vices */}
          <div className="space-y-4">
            <h3 className="text-amber-400/80 text-sm font-semibold uppercase tracking-wider">Vices</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {VICE_OPTIONS.map(vice => {
                const currentValue = formData.vices.find(v => v[vice] !== undefined);
                return (
                  <div key={vice} className="space-y-2">
                    <label className="text-sm text-amber-100/70">{vice}</label>
                    <select
                      value={currentValue?.[vice] || "No"}
                      onChange={(e) => handleViceChange(vice, e.target.value)}
                      className="flex h-10 w-full rounded-md border bg-black/50 border-amber-500/30 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    >
                      <option value="Yes" className="text-black">Yes</option>
                      <option value="No" className="text-black">No</option>
                      <option value="Sometimes" className="text-black">Sometimes</option>
                      <option value="Prefer Not to Say" className="text-black">Prefer Not to Say</option>
                    </select>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="visibleVices"
                checked={formData.visibleVices}
                onChange={handleChange}
                className="rounded border-amber-500/30 bg-black/50 text-amber-500 focus:ring-amber-500/50"
              />
              <label className="text-sm text-amber-100/60">Show vices on profile</label>
            </div>
          </div>

          {/* Interests */}
          <div className="space-y-4">
            <h3 className="text-amber-400/80 text-sm font-semibold uppercase tracking-wider">Interests</h3>
            
            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-3 border border-amber-500/20 rounded-lg bg-black/30">
              {INTERESTS_WITH_ICONS.map((interest) => (
                <label
                  key={interest.value}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm cursor-pointer transition-colors ${
                    formData.interests.includes(interest.value)
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'text-amber-100/60 hover:text-amber-100/80 border border-amber-500/10 hover:border-amber-500/20'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.interests.includes(interest.value)}
                    onChange={(e) => handleArrayChange('interests', interest.value, e.target.checked)}
                    className="hidden"
                  />
                  <span>{interest.icon}</span>
                  <span className="capitalize">{interest.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Preferred Ethnicities */}
          <div className="space-y-4">
            <h3 className="text-amber-400/80 text-sm font-semibold uppercase tracking-wider">Preferred Ethnicities</h3>
            
            <div className="flex flex-wrap gap-2 p-3 border border-amber-500/20 rounded-lg bg-black/30">
              {ETHNICITY_OPTIONS.map((ethnicity) => (
                <label
                  key={ethnicity}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm cursor-pointer transition-colors ${
                    formData.ethinicity.includes(ethnicity)
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'text-amber-100/60 hover:text-amber-100/80 border border-amber-500/10 hover:border-amber-500/20'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.ethinicity.includes(ethnicity)}
                    onChange={(e) => handleArrayChange('ethinicity', ethnicity, e.target.checked)}
                    className="hidden"
                  />
                  <span className="capitalize">{ethnicity}</span>
                </label>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isEthnicityBreak"
                checked={formData.isEthnicityBreak}
                onChange={handleChange}
                className="rounded border-amber-500/30 bg-black/50 text-amber-500 focus:ring-amber-500/50"
              />
              <label className="text-sm text-amber-100/60">Don't show ethnicity preference (break)</label>
            </div>
          </div>

          {/* Preferred Religions */}
          <div className="space-y-4">
            <h3 className="text-amber-400/80 text-sm font-semibold uppercase tracking-wider">Preferred Religions</h3>
            
            <div className="flex flex-wrap gap-2 p-3 border border-amber-500/20 rounded-lg bg-black/30">
              {RELIGION_OPTIONS.map((rel) => (
                <label
                  key={rel}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm cursor-pointer transition-colors ${
                    formData.religion.includes(rel)
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'text-amber-100/60 hover:text-amber-100/80 border border-amber-500/10 hover:border-amber-500/20'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.religion.includes(rel)}
                    onChange={(e) => handleArrayChange('religion', rel, e.target.checked)}
                    className="hidden"
                  />
                  <span className="capitalize">{rel}</span>
                </label>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isReligionBreak"
                checked={formData.isReligionBreak}
                onChange={handleChange}
                className="rounded border-amber-500/30 bg-black/50 text-amber-500 focus:ring-amber-500/50"
              />
              <label className="text-sm text-amber-100/60">Don't show religion preference (break)</label>
            </div>
          </div>

          {/* Gallery Images */}
          <div className="space-y-4">
            <h3 className="text-amber-400/80 text-sm font-semibold uppercase tracking-wider">Gallery Images</h3>
            
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <div key={index} className="relative aspect-[3/4] rounded-xl overflow-hidden border border-amber-500/20 bg-black/30">
                  {galleryImages[index] ? (
                    <>
                      <img
                        src={typeof galleryImages[index] === 'string' ? galleryImages[index] as string : URL.createObjectURL(galleryImages[index] as File)}
                        alt={`Gallery ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(index)}
                        className="absolute top-1 right-1 bg-red-500/80 hover:bg-red-500 text-white p-1 rounded-full"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer hover:bg-amber-500/10 transition-colors">
                      <Upload className="w-6 h-6 text-amber-400/50" />
                      <span className="text-xs text-amber-400/50 mt-1">Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleGalleryImageChange(index, file);
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-amber-400/40">Upload up to 6 images (recommended: 3:4 ratio)</p>
          </div>

          <div className="pt-4 flex justify-end gap-3 sticky bottom-0 bg-[#1a0500] pb-4">
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
              className="bg-amber-500 hover:bg-amber-400 text-black font-semibold px-8"
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}