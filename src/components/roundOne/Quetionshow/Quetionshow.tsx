"use client";

import Button from "@/components/share/ButtonPrimary";
import SideBar from "@/components/share/SideBar";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";

// --- Types -------------------------------------------------------------------

interface Participant {
  id: number;
  name: string;
  avatar: string;
  status: "READY" | "WAITING" | "OFFLINE";
  color: string;
  image: string;
}

interface Player {
  id: number;
  label: string;
  shortName: string;
  name: string;
  avatar: string;
  color: string;
  image: string;
  answer: string;
  thinking: boolean;
  eliminated: boolean;
}
const PARTICIPANTS: Participant[] = [
  {
    id: 1,
    name: "Savan Nguyen",
    avatar: "SN",
    status: "READY",
    color: "#f97316",
    image: "https://i.pravatar.cc/150?img=11",
  },
  {
    id: 2,
    name: "Darrell Steward",
    avatar: "DS",
    status: "READY",
    color: "#60a5fa",
    image: "https://i.pravatar.cc/150?img=12",
  },
  {
    id: 3,
    name: "Jane Cooper",
    avatar: "JC",
    status: "READY",
    color: "#34d399",
    image: "https://i.pravatar.cc/150?img=5",
  },
  {
    id: 4,
    name: "Esther Howard",
    avatar: "EH",
    status: "READY",
    color: "#a78bfa",
    image: "https://i.pravatar.cc/150?img=9",
  },
  {
    id: 5,
    name: "Jerome Bell",
    avatar: "JB",
    status: "READY",
    color: "#fbbf24",
    image: "https://i.pravatar.cc/150?img=15",
  },
  {
    id: 6,
    name: "Annette Black",
    avatar: "AB",
    status: "WAITING",
    color: "#f472b6",
    image: "https://i.pravatar.cc/150?img=20",
  },
  {
    id: 7,
    name: "Ronald Richards",
    avatar: "RR",
    status: "READY",
    color: "#22d3ee",
    image: "https://i.pravatar.cc/150?img=33",
  },
  {
    id: 8,
    name: "Eleanor Pena",
    avatar: "EP",
    status: "OFFLINE",
    color: "#86efac",
    image: "https://i.pravatar.cc/150?img=47",
  },
];

// --- Mock Data ----------------------------------------------------------------

const INITIAL_PLAYERS: Player[] = [
  {
    id: 1,
    label: "PLAYER 1",
    shortName: "P1",
    name: "Savan Nguyen",
    avatar: "SN",
    color: "#f97316",
    image: "https://i.pravatar.cc/150?img=11",
    answer: "I don’t like toxic people.",
    thinking: true,
    eliminated: false,
  },
  {
    id: 2,
    label: "PLAYER 2",
    shortName: "P2",
    name: "Darrell Steward",
    avatar: "DS",
    color: "#60a5fa",
    image: "https://i.pravatar.cc/150?img=12",
    answer: "I prefer tall guys.",
    thinking: true,
    eliminated: false,
  },
];

// --- Typing Hook --------------------------------------------------------------

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

// --- ThinkingDots -------------------------------------------------------------

function ThinkingDots() {
  return (
    <span className="inline-flex items-center gap-1 ml-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce"
          style={{ animationDelay: `${i * 160}ms` }}
        />
      ))}
    </span>
  );
}

// --- StatusBadge -------------------------------------------------------------

function StatusBadge({ status }: { status: Participant["status"] }) {
  const cfg = {
    READY: {
      cls: "text-emerald-400",
      dot: "bg-emerald-400 animate-pulse",
      label: "READY",
    },
    WAITING: { cls: "text-amber-400", dot: "bg-amber-400", label: "WAITING" },
    OFFLINE: { cls: "text-zinc-500", dot: "bg-zinc-600", label: "OFFLINE" },
  }[status];
  return (
    <span
      className={`flex items-center gap-1.5 text-[10px] font-bold tracking-widest ${cfg.cls}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

// --- ParticipantRow -----------------------------------------------------------

// --- PlayerCard ---------------------------------------------------------------

function PlayerCard({
  player,
  onEliminate,
}: {
  player: Player;
  onEliminate: (id: number) => void;
}) {
  const displayed = useTypingEffect(player.thinking ? "" : player.answer);
  const [imgErr, setImgErr] = useState(false);

  return (
    <div
      className={`relative flex flex-col rounded-2xl max-h-92 overflow-hidden transition-all duration-500
        ${player.eliminated ? "opacity-40 scale-[0.97] grayscale" : "opacity-100 scale-100"}`}
      style={{
        background: "linear-gradient(160deg, #1a0808 0%, #0e0404 100%)",
        border: "1.5px solid rgba(220,38,38,0.38)",
        boxShadow: player.eliminated
          ? "none"
          : "0 0 40px rgba(180,20,20,0.2), inset 0 1px 0 rgba(255,255,255,0.04)",
      }}
    >
      {/* Top glow */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-500/60 to-transparent" />

      {/* -- 1. Header: label + status badge -- */}
      <div className="px-5 pt-5  flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500/70" />
          <span className="text-[11px] font-black tracking-[0.22em] text-zinc-400 uppercase">
            {player.label}
          </span>
        </div>
        {/* <span
          className={`text-[10px] font-bold tracking-widest px-2.5 py-0.5 rounded-full border
            ${
              player.eliminated
                ? "text-red-400 bg-red-400/10 border-red-400/30"
                : player.thinking
                  ? "text-amber-400 bg-amber-400/10 border-amber-400/30"
                  : "text-emerald-400 bg-emerald-400/10 border-emerald-400/30"
            }`}
        >
          {player.eliminated
            ? "ELIMINATED"
            : player.thinking
              ? "THINKING"
              : "ANSWERED"}
        </span> */}
        <span
          className={`text-[10px] font-bold tracking-widest px-2.5 py-0.5 rounded-full border
            ${
              player.eliminated
                ? "text-red-400 bg-red-400/10 border-red-400/30"
                : player.thinking
                  ? "text-amber-400 bg-amber-400/10 border-amber-400/30"
                  : "text-emerald-400 bg-emerald-400/10 border-emerald-400/30"
            }`}
        >
          {player.eliminated
            ? "ELIMINATED"
            : player.thinking
              ? "THINKING"
              : "ANSWERED"}
        </span>
      </div>

      {/* -- 2. Player image (small, centered) -- */}
      <div className="flex flex-col items-center pb-2 px-5">
        <div
          className="p-[3px] rounded-full"
          style={{
            background: `conic-gradient(${player.color}80, transparent, ${player.color}80)`,
          }}
        >
          <div
            className="relative w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-full overflow-hidden"
            style={{ boxShadow: `0 0 20px ${player.color}50` }}
          >
            {!imgErr ? (
              <img
                src={player.image}
                alt={player.name}
                className="w-full h-full object-cover"
                onError={() => setImgErr(true)}
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center text-white text-xl font-black"
                style={{
                  background: `radial-gradient(circle at 35% 35%, ${player.color}cc, ${player.color}55)`,
                }}
              >
                {player.avatar}
              </div>
            )}
          </div>
        </div>

        {/* Status dot + name */}
        <div className="mt-2.5 flex items-center gap-1.5">
          <span
            className="w-2 h-2 rounded-full"
            style={{
              background: player.eliminated
                ? "#6b7280"
                : player.thinking
                  ? "#fbbf24"
                  : "#34d399",
              boxShadow: player.eliminated
                ? "none"
                : `0 0 6px ${player.thinking ? "#fbbf24" : "#34d399"}`,
            }}
          />
          <p className="text-sm font-bold text-zinc-200 tracking-wide">
            {player.name}
          </p>
        </div>
      </div>

      {/* Thin separator */}
      <div className="mx-4 h-px bg-white/5 mb-3" />

      {/* -- 3. Answer / Thinking area -- */}
      <div
        className="mx-4 mb-4 rounded-xl flex items-center justify-center min-h-[90px] sm:min-h-[105px] relative overflow-hidden px-4"
        style={{
          background: "rgba(0,0,0,0.42)",
          border: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        {/* Corner accents */}
        <span className="absolute top-2 left-2 w-3.5 h-3.5 border-t border-l border-red-800/40 rounded-tl" />
        <span className="absolute top-2 right-2 w-3.5 h-3.5 border-t border-r border-red-800/40 rounded-tr" />
        <span className="absolute bottom-2 left-2 w-3.5 h-3.5 border-b border-l border-red-800/40 rounded-bl" />
        <span className="absolute bottom-2 right-2 w-3.5 h-3.5 border-b border-r border-red-800/40 rounded-br" />

        <div className="text-center w-full">
          {player.thinking ? (
            <p className="text-white text-base italic flex items-center justify-center gap-1">
              {player.answer}
            </p>
          ) : (
            <p className="text-zinc-200 text-sm leading-relaxed font-medium">
              {displayed}
              <span className="animate-pulse text-red-400 ml-0.5">|</span>
            </p>
          )}
        </div>
      </div>

      {/* -- 4. Eliminate button -- */}
      {!player.eliminated && (
        <div className="px-4 pb-5 flex justify-center">
          <Button variant="game" onClick={() => onEliminate(player.id)}>
            ELIMINATE {player.shortName}
          </Button>
        </div>
      )}

      {/* Bottom glow */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-red-800/50 to-transparent" />
    </div>
  );
}

// --- Main ---------------------------------------------------------------------

export default function QuesationShow() {
  const [players, setPlayers] = useState<Player[]>(INITIAL_PLAYERS);
  const [timer, setTimer] = useState(120);
  const router = useRouter();

  useEffect(() => {
    if (timer <= 0) return;
    const iv = setInterval(() => setTimer((t) => Math.max(0, t - 1)), 1000);
    return () => clearInterval(iv);
  }, [timer]);

  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const handleEliminate = (id: number) => {
    setPlayers((prev) =>
      prev.map((p) => (p.id === id ? { ...p, eliminated: true } : p)),
    );
    router.push("/round/round-one-final");
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center">
      {/* Top bar */}
      <header className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 pt-5 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-red-400/80 text-[10px] font-bold tracking-[0.2em] uppercase">
            Live
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-mono font-bold
              ${timer < 30 ? "text-red-400 border-red-500/40 bg-red-500/10" : "text-zinc-300 border-white/10 bg-white/5"}`}
          >
            <svg
              className="w-3.5 h-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            {fmt(timer)}
          </div>
          {/* <span className="text-zinc-600 text-xs hidden sm:block">
            {readyCount}/{PARTICIPANTS.length} Ready
          </span> */}
        </div>
      </header>

      {/* Hero */}
      <div className="w-full max-w-6xl px-4 sm:px-6 pt-5 pb-5 text-center">
        <p className="text-red-500/50 text-[10px] tracking-[0.35em] font-bold uppercase mb-2">
          Host Control Panel
        </p>
        <h1
          className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-[0.14em] text-white"
          style={{
            fontFamily: "'Georgia', serif",
            textShadow:
              "0 0 40px rgba(220,38,38,0.45), 0 2px 4px rgba(0,0,0,0.8)",
          }}
        >
          Round 1 — Questions
        </h1>
        <p className="mt-2 text-sm text-zinc-400 tracking-[0.15em] uppercase font-medium">
          Next Match-Up: <span className="text-red-400 font-bold">P1</span>
          <span className="text-zinc-600 mx-1.5">vs</span>
          <span className="text-red-400 font-bold">P2</span>
        </p>
        <div className="mt-4 flex items-center justify-center gap-3">
          <div className="h-px w-20 sm:w-40 bg-gradient-to-r from-transparent to-red-700/50" />
          <div className="w-1.5 h-1.5 rotate-45 bg-red-600" />
          <div className="h-px w-20 sm:w-40 bg-gradient-to-l from-transparent to-red-700/50" />
        </div>
      </div>

      {/* Stat pills */}
      <div className="w-full max-w-7xl px-4 sm:px-6 pb-5 flex flex-wrap justify-center gap-3">
        {[
          { label: "Round", value: "1 of 5" },
          { label: "Points", value: "100 pts" },
          {
            label: "Active",
            value: `${players.filter((p) => !p.eliminated).length} Players`,
          },
        ].map((s) => (
          <div
            key={s.label}
            className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/8 bg-white/4 backdrop-blur-sm"
          >
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest">
              {s.label}
            </span>
            <span className="text-sm font-bold text-zinc-200">{s.value}</span>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <main className="w-full max-w-7xl px-4 mt-6 sm:px-6 lg:px-8 pb-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_320px] xl:grid-cols-[1fr_1fr_360px] gap-4 sm:gap-5">
        {players.map((player) => (
          <PlayerCard
            key={player.id}
            player={player}
            onEliminate={handleEliminate}
          />
        ))}

        {/* Participants panel */}
        <SideBar />
      </main>

      {/* Footer */}
      <footer className="w-full max-w-6xl px-4 sm:px-6 pb-6 flex justify-center">
        <p className="text-zinc-700 text-[10px] tracking-[0.3em] uppercase">
          Quiz Show — Host Control Panel
        </p>
      </footer>
    </div>
  );
}
