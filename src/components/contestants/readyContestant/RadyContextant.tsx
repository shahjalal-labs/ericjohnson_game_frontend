"use client";
import Button from "@/components/share/ButtonPrimary";

import { useState, useEffect } from "react";
import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  AvatarBubble,
  mapServerPlayers,
} from "@/components/roundOne/InternetBachelor";
import { useSocket } from "@/hooks/useSocket";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useSocketSync } from "@/hooks/useSocketSync";
import Swal from "sweetalert2";

interface Participant {
  id: number;
  name: string;
  avatar: string;
  ready: boolean;
}

interface ServerPlayer {
  id: string;
  socketId: string;
  isEliminated: boolean;
  isReady: boolean;
  isConnected: boolean;
  username?: string;
  name?: string;
}

function ReadyContestant() {
  useSocketSync();
  const question = '"CONNECTED TO LOBBY"';
  const [charIdx, setCharIdx] = useState(0);
  const router = useRouter();
  
  const participants = useSelector((state: RootState) => state.participants.players);
  console.log(participants);

  const { sendEvent, isConnected } = useSocket({
    GAME_EVENT: (payload) => {
      console.log("🎮 Game Event received:", payload);
      // PLAYERS_UPDATE is handled by useSocketSync globally
      if (payload.type === "GAME_ENDED") {
        Swal.fire({
          title: "Game Ended",
          text: "The host has quit the game.",
          icon: "info",
          confirmButtonColor: "#d33",
          confirmButtonText: "Return to Home",
          background: "#1A0500",
          color: "#fff"
        }).then(() => {
          router.push("/");
        });
      }
    },

    ROSE_GIVEN: (payload) => {
      console.log("🌹 Rose given to:", payload.player);
    },
    PLAYER_ELIMINATED: (payload) => {
      console.log("💔 Eliminated:", payload.player);
    },
    GAME_ENDED: (payload) => {
      console.log("🏁 Game Over:", payload);
      Swal.fire({
        title: "Game Ended",
        text: "The host has quit the game.",
        icon: "info",
        confirmButtonColor: "#d33",
        confirmButtonText: "Return to Home",
        background: "#1A0500",
        color: "#fff"
      }).then(() => {
        router.push("/");
      });
    },
  });

  useEffect(() => {
    if (charIdx < question.length) {
      const t = setTimeout(() => setCharIdx((c) => c + 1), 40);
      return () => clearTimeout(t);
    }
  }, [charIdx, question.length]);

  //   const handleReady = () => {
  //     sendEvent(
  //       "PLAYER_READY",
  //       {
  //         gameId: "internet-bachelor-123",
  //         type: "PLAYER_READY",
  //         payload: {},
  //       },
  //       (response) => {
  //         console.log("✅ Server ACK:", response);
  //         // if (response.success) {
  //         //   router.push("/host");
  //         // }
  //       },
  //     );
  //   };

  const handleReady = () => {
    sendEvent(
      "GAME_EVENT",
      {
        gameId: "internet-bachelor-123",
        type: "PLAYER_READY",
        payload: {},
      },
      (response) => {
        console.log("✅ Server ACK:", response);
      },
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 flex flex-col gap-6">
      <p>Status: {isConnected() ? "🟢 Connected" : "🔴 Disconnected"}</p>
      <p className="text-white/40 uppercase tracking-[0.25em] text-xs font-semibold">
        Contestant 1
      </p>

      <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-black/90 to-rose-950/50 backdrop-blur-sm p-8 sm:p-14 flex flex-col items-center gap-8 min-h-[280px] justify-center">
        {/* Animated question */}
        <div className="text-center">
          <p className="text-white font-bold text-lg sm:text-2xl italic leading-relaxed min-h-[3.5rem]">
            {question.slice(0, charIdx)}
            {charIdx < question.length && (
              <span className="inline-block w-0.5 h-6 bg-amber-400 align-middle animate-pulse ml-0.5" />
            )}
          </p>
        </div>

        <div className="flex flex-col items-center gap-2">
          <p className="text-white text-sm uppercase tracking-widest">
            Waiting for the host to start the tournament
          </p>
          <p className="text-[#52C41A] text-2xl font-extrabold uppercase mt-3 tracking-widest flex items-center">
            I AM READY <Check size={36} />
          </p>
        </div>

        <Button variant="game" onClick={handleReady}>
          ready
        </Button>
      </div>

      {/* Active contestants strip */}
      <div className="text-center">
        <p className="text-white/30 text-xs uppercase tracking-widest mb-3">
          Active Contestants
        </p>
        {/* <div className="flex items-center justify-center flex-wrap gap-2">
          {PARTICIPANTS.map((p, i) => (
            <div key={p.id} className="relative">
              <AvatarBubble initials={p.avatar} index={i} size="sm" ring />
            </div>
          ))}
        </div> */}
        {/* <div className="flex items-center justify-center flex-wrap gap-2">
          {participants.map((p: ServerPlayer, i) => {
            const name = p.username || p.name || "??";
            const initials = name
              .split(" ")
              .map((w) => w[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);

            return (
              <div
                key={p.id}
                className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-300 text-xs font-bold"
              >
                {initials}
              </div>
            );
          })}
        </div> */}
        <div className="flex items-center justify-center flex-wrap gap-2">
          {participants.map((p, i) => (
            <div
              key={p.id}
              className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-300 text-xs font-bold"
            >
              {i + 1}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ReadyContestant;
