"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Calendar } from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/redux/store"
import { setDatingPreferences } from "@/redux/allSlice/onboardingSlice"

interface AgeRangeStepProps {
  currentStep: number
  totalSteps: number
  onNext: () => void
  onBack: () => void
}

export default function AgeRangeStep({ 
  currentStep, 
  totalSteps, 
  onNext, 
  onBack 
}: AgeRangeStepProps) {
  const dispatch = useAppDispatch()
  const datingPreferences = useAppSelector((state) => state.onboarding.datingPreferences)
  
  const [minAge, setMinAge] = useState<number>(datingPreferences.preferredMinAge.value || 18)
  const [maxAge, setMaxAge] = useState<number>(datingPreferences.preferredMaxAge.value || 70)
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  const ages = Array.from({ length: 53 }, (_, i) => i + 18)
  ages.push(71)

  useEffect(() => {
    if (minAge > maxAge) {
      setMinAge(maxAge)
    }
  }, [minAge, maxAge])

  const handleMinAgeChange = (age: number) => {
    let newMinAge = age
    if (age > maxAge) {
      newMinAge = maxAge
    }
    setMinAge(newMinAge)
    dispatch(
      setDatingPreferences({
        field: "preferredMinAge",
        value: newMinAge === 71 ? "70+" : newMinAge,
        visible: true,
      })
    )
    if (errors.minAge) {
      setErrors(prev => ({ ...prev, minAge: "" }))
    }
  }

  const handleMaxAgeChange = (age: number) => {
    let newMaxAge = age
    if (age < minAge) {
      newMaxAge = minAge
    }
    setMaxAge(newMaxAge)
    dispatch(
      setDatingPreferences({
        field: "preferredMaxAge",
        value: newMaxAge === 71 ? "70+" : newMaxAge,
        visible: true,
      })
    )
    if (errors.maxAge) {
      setErrors(prev => ({ ...prev, maxAge: "" }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (minAge < 18) {
      newErrors.minAge = "Minimum age must be at least 18"
    }
    
    if (maxAge > 71) {
      newErrors.maxAge = "Maximum age cannot exceed 70+"
    }
    
    if (minAge > maxAge) {
      newErrors.range = "Minimum age cannot be greater than maximum age"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateForm()) {
      onNext()
    }
  }

  const getDisplayAge = (age: number) => {
    return age === 71 ? "70+" : age.toString()
  }

  // Get scroll reference for centering
  const scrollToAge = (age: number, containerId: string) => {
    const container = document.getElementById(containerId)
    const button = container?.querySelector(`[data-age="${age}"]`)
    if (container && button) {
      const containerHeight = container.clientHeight
      const buttonTop = (button as HTMLElement).offsetTop
      const buttonHeight = (button as HTMLElement).clientHeight
      container.scrollTop = buttonTop - (containerHeight / 2) + (buttonHeight / 2)
    }
  }

  useEffect(() => {
    scrollToAge(minAge, 'min-age-picker')
  }, [minAge])

  useEffect(() => {
    scrollToAge(maxAge, 'max-age-picker')
  }, [maxAge])

  return (
    <div className="bg-[#1A0500]/80 backdrop-blur-xl border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl max-w-md mx-auto">
      {/* Back Button */}
      <button 
        onClick={onBack} 
        className="mb-6 p-2 -ml-2 text-amber-100/40 hover:text-amber-100/80 hover:bg-amber-500/20 rounded-full transition-all"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>

      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-amber-100 mb-2">Age Range</h1>
        <p className="text-amber-100/60">Choose your preferred age range</p>
      </div>

      {/* Progress Stepper */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div
            key={index}
            className={`transition-all duration-300 ${
              index + 1 === currentStep
                ? "w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-600 rounded-full flex items-center justify-center shadow-lg"
                : index + 1 < currentStep
                  ? "w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-600 rounded-full"
                  : "w-2 h-2 bg-gray-300 rounded-full"
            }`}
          >
            {index + 1 === currentStep && <Calendar className="w-4 h-4 text-white" />}
          </div>
        ))}
      </div>

      {/* Error Message */}
      {errors.range && (
        <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-red-600 text-sm text-center">{errors.range}</p>
        </div>
      )}

      {/* Age Range Display Card */}
      <div className="mb-8 bg-gradient-to-br from-[#2a0800] to-[#1A0500] rounded-2xl p-6 border border-amber-500/30 shadow-inner">
        <div className="flex items-center justify-center gap-6">
          <div className="text-center">
            <p className="text-xs font-medium text-amber-100/60 mb-1 uppercase tracking-wide">From</p>
            <p className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-600 bg-clip-text text-transparent">
              {getDisplayAge(minAge)}
            </p>
          </div>
          <div className="h-12 w-px bg-gradient-to-b from-amber-500/10 via-amber-500/30 to-amber-500/10" />
          <div className="text-center">
            <p className="text-xs font-medium text-amber-100/60 mb-1 uppercase tracking-wide">To</p>
            <p className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-600 bg-clip-text text-transparent">
              {getDisplayAge(maxAge)}
            </p>
          </div>
        </div>
      </div>

      {/* Age Pickers in Two Columns */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {/* Minimum Age Picker */}
        <div>
          <h3 className="text-sm font-semibold text-amber-100/80 mb-3 text-center">Minimum</h3>
          {errors.minAge && (
            <p className="text-red-500 text-xs mb-2 text-center">{errors.minAge}</p>
          )}
          <div className="relative h-64 bg-[#2a0800] rounded-2xl overflow-hidden border border-amber-500/30 shadow-inner">
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-12 bg-amber-500/20 pointer-events-none z-10 border-y border-amber-500/40" />
            <div 
              id="min-age-picker"
              className="relative h-full overflow-y-auto scrollbar-hide py-24 z-20"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {ages.map((age) => (
                <button
                  key={`min-${age}`}
                  data-age={age}
                  onClick={() => handleMinAgeChange(age)}
                  className={`w-full py-3 transition-all duration-200 ${
                    age === minAge 
                      ? "text-amber-400 font-bold text-2xl scale-110" 
                      : age === minAge - 1 || age === minAge + 1
                        ? "text-amber-100/60 text-lg"
                        : "text-amber-100/40 text-base"
                  }`}
                >
                  {getDisplayAge(age)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Maximum Age Picker */}
        <div>
          <h3 className="text-sm font-semibold text-amber-100/80 mb-3 text-center">Maximum</h3>
          {errors.maxAge && (
            <p className="text-red-500 text-xs mb-2 text-center">{errors.maxAge}</p>
          )}
          <div className="relative h-64 bg-[#2a0800] rounded-2xl overflow-hidden border border-amber-500/30 shadow-inner">
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-12 bg-amber-500/20 pointer-events-none z-10 border-y border-amber-500/40" />
            <div 
              id="max-age-picker"
              className="relative h-full overflow-y-auto scrollbar-hide py-24"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {ages.map((age) => (
                <button
                  key={`max-${age}`}
                  data-age={age}
                  onClick={() => handleMaxAgeChange(age)}
                  className={`w-full py-3 transition-all duration-200 relative z-20 ${
                    age === maxAge 
                      ? "text-amber-400 font-bold text-2xl scale-110" 
                      : age === maxAge - 1 || age === maxAge + 1
                        ? "text-amber-100/60 text-lg"
                        : "text-amber-100/40 text-base"
                  }`}
                >
                  {getDisplayAge(age)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Next Button */}
      <Button
        onClick={handleNext}
        className="w-full h-14 bg-gradient-to-r from-yellow-400 to-orange-600 hover:from-yellow-300 hover:to-orange-500 text-white font-semibold rounded-full text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
      >
        Continue
      </Button>
    </div>
  )
}