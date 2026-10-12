"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import coinImage from "@/assets/coin.png";
import Button from "@/components/share/ButtonPrimary";
import { useRouter } from "next/navigation";

interface Participant {
  id: number;
  name: string;
  avatar: string;
  ready: boolean;
}

// --- Mock Data ----------------------------------------------------------------
const PARTICIPANTS: Participant[] = [
  { id: 1, name: "Savan Nguyen", avatar: "SN", ready: true },
  { id: 2, name: "Darrell Steward", avatar: "DS", ready: true },
  { id: 3, name: "Jane Cooper", avatar: "JC", ready: true },
  { id: 4, name: "Esther Howard", avatar: "EH", ready: true },
  { id: 5, name: "Jerome Bell", avatar: "JB", ready: true },
  { id: 6, name: "Annette Black", avatar: "AB", ready: true },
  { id: 7, name: "Ronald Richards", avatar: "RR", ready: true },
  { id: 8, name: "Eleanor Pena", avatar: "EP", ready: true },
];
const AVATAR_COLORS = [
  "from-rose-500 to-pink-600",
  "from-amber-500 to-orange-600",
  "from-emerald-500 to-teal-600",
  "from-violet-500 to-purple-600",
  "from-sky-500 to-blue-600",
  "from-fuchsia-500 to-pink-600",
  "from-lime-500 to-green-600",
  "from-cyan-500 to-blue-600",
];

function AvatarBubble({
  initials,
  index,
  size = "md",
  ring = false,
}: {
  initials: string;
  index: number;
  size?: "sm" | "md" | "lg";
  ring?: boolean;
}) {
  const sizeClasses = {
    sm: "w-9 h-9 text-xs",
    md: "w-11 h-11 text-sm",
    lg: "w-14 h-14 text-base",
  };
  return (
    <div
      className={`
        ${sizeClasses[size]} rounded-full bg-gradient-to-br ${AVATAR_COLORS[index % AVATAR_COLORS.length]}
        flex items-center justify-center font-bold text-white flex-shrink-0
        ${ring ? "ring-2 ring-amber-400/60 ring-offset-1 ring-offset-black" : ""}
        shadow-lg
      `}
    >
      {initials}
    </div>
  );
}

function SpinnerIcon() {
  return (
    <div className="relative w-10 h-10">
      <div className="absolute inset-0 rounded-full border-2 border-white/10" />
      <div className="absolute inset-0 rounded-full border-2 border-t-rose-500 border-r-amber-400 border-b-transparent border-l-transparent animate-spin" />
    </div>
  );
}

export default function RounTwoFinal() {
  const question = '"What is your deal-breaker?"';
  const [charIdx, setCharIdx] = useState(0);
  const [loading, setLoading] = useState(false); // ✅ NEW

  const router = useRouter();

  useEffect(() => {
    if (charIdx < question.length) {
      const t = setTimeout(() => setCharIdx((c) => c + 1), 40);
      return () => clearTimeout(t);
    }
  }, [charIdx, question.length]);

  // ✅ CLICK HANDLER
  const handleSend = async () => {
    setLoading(true);

    try {
      // 👉 simulate API call (replace with real API)
      await new Promise((res) => setTimeout(res, 2000));
      console.log("Sent!");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 flex flex-col gap-6 mt-22">
      <p className="text-white/40 uppercase tracking-[0.25em] text-xs font-semibold">
        Contestant 1
      </p>

      <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-black/90 to-rose-950/50 backdrop-blur-sm p-8 sm:p-14 flex flex-col items-center gap-8 min-h-[480px] justify-center">
        {/* Animated question */}

        <div className="4">
          <div className="text-center w-full">
            {/* Main Title */}
            <h1 className="text-white text-xl sm:text-2xl md:text-3xl  uppercase font-semibold leading-relaxed">
              Thank YOU FOR PLAYING
            </h1>
            <p className="text-[#52C41A] 6 text-xs sm:text-lg font-bold  leading-relaxed">
              RUNNER UP : PLAYER 7
            </p>

            <div className="flex justify-center mt-5">
              <Image
                src={coinImage}
                alt="Game Over"
                // width={244}
                // height={200}
                // className="w-20 h-20"
                priority
              />
            </div>

            {/* Description */}
            <p className="text-gray-100 mt-6 text-xs sm:text-sm  leading-relaxed">
              Try again next time. Don’t worry you got 1000 pts
            </p>

            <div className="flex justify-center mt-4">
              {/* Actions */}
              <div className={`flex gap-3 mt-7 flex-wrap justify-center `}>
                {/* Play Again */}
                <button
                  onClick={() => router.push("/")}
                  className="font-[Rajdhani] font-bold tracking-[0.18em] text-[12px] uppercase px-7 py-2.5 rounded-[10px] 
               border border-yellow-400/30 bg-yellow-400/10 text-yellow-300 
               hover:bg-yellow-400/20 hover:shadow-[0_0_12px_rgba(255,185,0,0.4)] 
               transition-all duration-200 cursor-pointer"
                >
                  ↺ &nbsp;Play Again
                </button>

                {/* View Stats */}
                {/* <button
                  className="font-[Rajdhani] font-bold tracking-[0.18em] text-[12px] uppercase px-7 py-2.5 rounded-[10px] 
               border border-yellow-400/30 bg-yellow-400/10 text-yellow-300 
               hover:bg-yellow-400/20 hover:shadow-[0_0_12px_rgba(255,185,0,0.4)] 
               transition-all duration-200 cursor-pointer"
                >
                  ✦ &nbsp;View Stats
                </button> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
