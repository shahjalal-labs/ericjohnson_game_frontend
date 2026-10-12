"use client";

import { Button } from "@/components/ui/button";
import { setDatingPreferences } from "@/redux/allSlice/onboardingSlice";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { ArrowLeft, Heart } from "lucide-react";
import { useState } from "react";

interface DatingPreferencesStepProps {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onBack: () => void;
}

export default function DatingPreferencesStep({
  currentStep,
  totalSteps,
  onNext,
  onBack,
}: DatingPreferencesStepProps) {
  const dispatch = useAppDispatch();
  const datingPreferences = useAppSelector(
    (state) => state.onboarding.datingPreferences
  );

  const [selected, setSelected] = useState<string>(
    datingPreferences.interestedIn.value || "woman"
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const options = [
    { value: "Male", label: "Male" },
    { value: "Female", label: "Female" },
    { value: "Others", label: "Others" },
  ];

  const handleSelectionChange = (value: string) => {
    setSelected(value);
    dispatch(
      setDatingPreferences({
        field: "interestedIn",
        value,
        visible: true,
      })
    );
    // Clear error if exists
    if (errors.interestedIn) {
      setErrors((prev) => ({ ...prev, interestedIn: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!selected) {
      newErrors.interestedIn = "Please select who you're interested in";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      onNext();
    }
  };

  return (
    <div className="bg-[#1A0500]/80 backdrop-blur-xl border border-amber-500/30 rounded-3xl p-8 shadow-2xl">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="mb-4 text-amber-100/60 hover:text-amber-100 transition-colors"
      >
        <ArrowLeft className="w-6 h-6" />
      </button>

      {/* Header */}
      <h1 className="text-2xl font-bold text-center text-amber-100 mb-6">
        Dating Preferences
      </h1>

      {/* Progress Stepper */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div
            key={index}
            className={`transition-all duration-300 ${
              index + 1 === currentStep
                ? "w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-600 rounded-full flex items-center justify-center shadow-md"
                : index + 1 < currentStep
                ? "w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-600 rounded-full"
                : "w-3 h-3 bg-gray-300 rounded-full"
            }`}
          >
            {index + 1 === currentStep && (
              <Heart className="w-5 h-5 text-white fill-white" />
            )}
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-amber-100 mb-2">
          Interested In
        </h2>
        <p className="text-sm text-amber-100/60 mb-6">
          Select who you're interested in dating
        </p>

        {errors.interestedIn && (
          <p className="text-red-500 text-sm mb-4">{errors.interestedIn}</p>
        )}

        <div className="space-y-4">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSelectionChange(option.value)}
              className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-colors ${
                selected === option.value
                  ? "border-amber-500 bg-amber-500/20"
                  : "border-amber-500/30 hover:bg-amber-500/10 hover:border-amber-500/50"
              }`}
            >
              <span className="text-amber-100 font-medium">{option.label}</span>
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                  selected === option.value
                    ? "border-amber-500 bg-gradient-to-r from-yellow-400 to-orange-600"
                    : "border-amber-500/30"
                }`}
              >
                {selected === option.value && (
                  <div className="w-3 h-3 rounded-full bg-[#1A0500]/80 backdrop-blur-xl border border-amber-500/30" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Next Button */}
      <Button
        onClick={handleNext}
        className="w-full h-12 bg-gradient-to-r from-yellow-400 to-orange-600 hover:from-yellow-300 hover:to-orange-500 text-white font-medium rounded-full text-base shadow-lg"
      >
        Next
      </Button>
    </div>
  );
}
