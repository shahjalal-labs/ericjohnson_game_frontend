"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { X } from "lucide-react"
import { useState } from "react"

interface VicesModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (vices: { Alcohol: string; Smoking: string; Marijuana: string; Drugs: string }) => void
  currentVices: { Alcohol: string; Smoking: string; Marijuana: string; Drugs: string }
}

interface ViceOption {
  label: string
  value: string
}

const viceOptions: ViceOption[] = [
  { label: "Yes", value: "Yes" },
  { label: "No", value: "No" },
  { label: "Sometimes", value: "Sometimes" },
  { label: "Prefer not to say", value: "Prefer not to say" },
]

export default function VicesModal({ isOpen, onClose, onSave, currentVices }: VicesModalProps) {
  const [selectedVices, setSelectedVices] = useState(currentVices)

  const handleViceChange = (viceName: keyof typeof selectedVices, value: string) => {
    setSelectedVices(prev => ({
      ...prev,
      [viceName]: value
    }))
  }

  const handleSave = () => {
    onSave(selectedVices)
    onClose()
  }

  const getViceLabel = (viceName: keyof typeof selectedVices) => {
    switch (viceName) {
      case "Alcohol": return "Alcohol"
      case "Smoking": return "Smoking"
      case "Marijuana": return "Marijuana"
      case "Drugs": return "Drugs"
      default: return viceName
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-[#1A0500]/80 backdrop-blur-xl border border-amber-500/30 rounded-3xl p-6">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold text-amber-100">
              Select Vices
            </DialogTitle>
            {/* <button
              onClick={onClose}
              className="text-amber-100/60 hover:text-amber-100/80 transition-colors"
            >
              <X className="w-5 h-5" />
            </button> */}
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {(["Alcohol", "Smoking", "Marijuana", "Drugs"] as const).map((viceName) => (
            <div key={viceName} className="space-y-3">
              <h3 className="text-base font-medium text-amber-100">
                {getViceLabel(viceName)}
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {viceOptions.map((option) => (
                  <button
                    key={`${viceName}-${option.value}`}
                    onClick={() => handleViceChange(viceName, option.value)}
                    className={`px-4 py-3 rounded-xl border-2 transition-all text-center ${
                      selectedVices[viceName] === option.value
                        ? "border-amber-500 bg-amber-500/20 text-amber-400 font-medium"
                        : "border-amber-500/30 text-amber-100/80 hover:border-amber-500/50 hover:bg-amber-500/10"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 h-12 border-amber-500/30 text-amber-100/80 rounded-full hover:bg-amber-500/20"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1 h-12 bg-gradient-to-r from-yellow-400 to-orange-600 hover:from-yellow-300 hover:to-orange-500 text-white font-medium rounded-full"
          >
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}