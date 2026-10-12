"use client";

import Button from "@/components/share/ButtonPrimary";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import ParticipantPanel from "../Participantpanel";
import { useSocket } from "@/hooks/useSocket";
import { ArrowRight, Play } from "lucide-react";
import Cookies from "js-cookie";

// --- Types -------------------------------------------------------------------

interface Submission {
  userId: string;
  answer: string;
}

interface Player {
  userId: string;
  answer: string;
  index: number;
}

interface CanNextPayload {
  label: string;
  nextRoundIndex: number;
}

// --- Typing Hook -------------------------------------------------------------

function useTypingEffect(text: string, speed = 38) {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    setDisplayed("");
    if (!text) return;
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(iv);
    }, speed);
    return () => clearInterval(iv);
  }, [text, speed]);
  return displayed;
}

// --- PlayerCard --------------------------------------------------------------

const CARD_COLORS = [
  "#f97316",
  "#60a5fa",
  "#34d399",
  "#a78bfa",
  "#fbbf24",
  "#f472b6",
  "#22d3ee",
  "#86efac",
];

function PlayerCard({
  player,
  onEliminate,
  loading,
}: {
  player: Player;
  onEliminate: (userId: string) => void;
  loading: boolean;
}) {
  const displayed = useTypingEffect(player.answer);
  const color = CARD_COLORS[player.index % CARD_COLORS.length];

  return (
    <div
      className="relative flex flex-col rounded-2xl overflow-hidden transition-all duration-500"
      style={{
        background: "linear-gradient(160deg, #1a0808 0%, #0e0404 100%)",
        border: "1.5px solid rgba(220,38,38,0.38)",
        boxShadow:
          "0 0 40px rgba(180,20,20,0.2), inset 0 1px 0 rgba(255,255,255,0.04)",
      }}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-500/60 to-transparent" />

      {/* Header */}
      <div className="px-5 pt-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: color }}
          />
          <span className="text-[11px] font-black tracking-[0.22em] text-zinc-400 uppercase">
            Player {player.index + 1}
          </span>
        </div>
        <span className="text-[10px] font-bold tracking-widest px-2.5 py-0.5 rounded-full border text-emerald-400 bg-emerald-400/10 border-emerald-400/30">
          ANSWERED
        </span>
      </div>

      {/* Avatar */}
      <div className="flex justify-center py-4">
        <div
          className="p-[3px] rounded-full"
          style={{
            background: `conic-gradient(${color}80, transparent, ${color}80)`,
          }}
        >
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-white text-lg font-black"
            style={{
              background: `radial-gradient(circle at 35% 35%, ${color}cc, ${color}44)`,
              boxShadow: `0 0 20px ${color}50`,
            }}
          >
            {player.index + 1}
          </div>
        </div>
      </div>

      <div className="mx-4 h-px bg-white/5 mb-3" />

      {/* Answer Box */}
      <div
        className="mx-4 mb-4 rounded-xl flex items-center justify-center min-h-[100px] relative overflow-hidden px-4 py-4"
        style={{
          background: "rgba(0,0,0,0.42)",
          border: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <p className="text-zinc-200 text-sm leading-relaxed font-medium text-center">
          "{displayed}"
          <span className="animate-pulse text-red-400 ml-0.5">|</span>
        </p>
      </div>

      {/* Eliminate Button */}
      <div className="px-4 pb-5 flex justify-center">
        <Button
          variant="game"
          onClick={() => onEliminate(player.userId)}
          disabled={loading}
        >
          {loading ? "Eliminating..." : `ELIMINATE P${player.index + 1}`}
        </Button>
      </div>
    </div>
  );
}

// --- Main Component -----------------------------------------------------------

export default function ThinkingProccess() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [timer, setTimer] = useState(120);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [canNext, setCanNext] = useState(false);
  const [nextLabel, setNextLabel] = useState("Start Next Round");
  const [nextRoundIndex, setNextRoundIndex] = useState(1);
  const token = Cookies.get("accessToken") || null;

  const router = useRouter();

  const { sendEvent } = useSocket({
    GAME_EVENT: (payload) => {
      console.log("🎮 Game Event received:", payload);

      if (payload.type === "ANSWER_SUBMITTED") {
        const submissions: Submission[] = payload.payload.allSubmissions || [];
        setPlayers(
          submissions.map((s, i) => ({
            userId: s.userId,
            answer: s.answer,
            index: i,
          })),
        );
      }

      // ← NEW: Handle CAN_NEXT event
      if (payload.type === "CAN_NEXT") {
        const data: CanNextPayload = payload.payload;
        setCanNext(true);
        setNextLabel(data.label || "Start Next Round");
        setNextRoundIndex(data.nextRoundIndex || 1);
      }
    },
  });

  const handleEliminate = (userId: string) => {
    setLoadingId(userId);

    sendEvent(
      "GAME_EVENT",
      {
        gameId: "internet-bachelor-123",
        type: "ELIMINATE",
        payload: { playerIds: [userId], points: 100 },
      },
      (response) => {
        console.log("✅ Eliminate ACK:", response);
        setLoadingId(null);
      },
    );
  };

  // Next Round Handler
  const handleNextRound = () => {
    sendEvent(
      "GAME_EVENT",
      {
        gameId: "internet-bachelor-123",
        type: "NEXT_ROUND",
        payload: { roundIndex: nextRoundIndex },
      },
      (response) => {
        console.log("✅ Next Round ACK:", response);
        // Optionally navigate or let server handle redirect
        // router.push(`/round/${nextRoundIndex + 1}`);
        if (canNext) {
          router.push(`/round-two/round-two-two?x-token=${token}`);
        }
      },
    );
  };

  // Timer
  useEffect(() => {
    if (timer <= 0) return;
    const iv = setInterval(() => setTimer((t) => Math.max(0, t - 1)), 1000);
    return () => clearInterval(iv);
  }, [timer]);

  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="min-h-screen w-full flex flex-col items-center ">
      {/* Top bar */}
      {/* <header className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 pt-5 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-red-400/80 text-[10px] font-bold tracking-[0.2em] uppercase">
            LIVE • HOST CONTROL
          </span>
        </div>

        <div
          className={`flex items-center gap-2 px-4 py-1.5 rounded-full border text-sm font-mono font-bold
          ${timer < 30 ? "text-red-400 border-red-500/40 bg-red-500/10" : "text-zinc-300 border-white/10 bg-white/5"}`}
        >
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          {fmt(timer)}
        </div>
      </header> */}

      {/* Hero Title */}
      <div className="w-full max-w-6xl px-4 pt-6 pb-8 text-center">
        <p className="text-red-500/50 text-xs tracking-[0.35em] font-bold uppercase mb-3">
          HOST CONTROL PANEL
        </p>
        <h1 className="text-4xl sm:text-5xl uppercase font-black  tracking-widest text-white">
          ROUND 1 — Questions
        </h1>
        <p className="text-red-500/50 text-base tracking-[0.10em]  font-bold  capitalize mt-3">
          Eliminate Down to {players.length}
        </p>
      </div>

      {/* Stats */}
      <div className="w-full max-w-7xl px-4 pb-8 flex flex-wrap justify-center gap-3">
        {[
          { label: "ROUND", value: "1 of 3" },
          { label: "POINTS", value: "100 pts" },
          { label: "ANSWERED", value: `${players.length} / 7` },
        ].map((s) => (
          <div
            key={s.label}
            className="flex items-center gap-2 px-5 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm"
          >
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest">
              {s.label}
            </span>
            <span className="text-sm font-bold text-zinc-200">{s.value}</span>
          </div>
        ))}
      </div>

      <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 pb-10 flex gap-6">
        {/* Player Cards Grid */}
        {/* Player Cards Grid + Next Round Button */}
        <div className="flex-1 flex flex-col">
          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 content-start flex-1">
            {players.length === 0 ? (
              <div className="col-span-2 flex flex-col items-center justify-center min-h-[300px] gap-4">
                <div className="flex gap-2">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-3 h-3 rounded-full bg-zinc-600 animate-bounce"
                      style={{ animationDelay: `${i * 150}ms` }}
                    />
                  ))}
                </div>
                <p className="text-zinc-500 text-sm uppercase tracking-widest">
                  Waiting for player answers...
                </p>
              </div>
            ) : (
              players.map((player) => (
                <PlayerCard
                  key={player.userId}
                  player={player}
                  onEliminate={handleEliminate}
                  loading={loadingId === player.userId}
                />
              ))
            )}
          </div>

          {/* Next Round Button - Centered at Bottom */}
          {canNext && (
            <div className="mt-10 flex justify-center pb-6">
              <Button
                variant="game"
                onClick={handleNextRound}
                className="flex items-center gap-3 px-12 py-4 text-lg font-bold 
                   shadow-2xl shadow-red-600/40 hover:shadow-red-500/60 
                   hover:scale-105 active:scale-100 transition-all duration-300
                   min-w-[320px]"
              >
                {nextLabel}
                <ArrowRight className="w-6 h-6" />
              </Button>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="hidden lg:block w-[340px] flex-shrink-0 self-start sticky top-6">
          <ParticipantPanel />
        </div>
      </div>

      {/* Next Round Button - Appears when CAN_NEXT is received */}
    </div>
  );
}
