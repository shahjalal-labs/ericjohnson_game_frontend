"use client";

import Button from "@/components/share/ButtonPrimary";
import { useSocket } from "@/hooks/useSocket";
import { useRouter } from "next/navigation";
import React, { useState, useRef, useEffect } from "react";
import { mapServerPlayers } from "./InternetBachelor";
import ParticipantPanel from "./Participantpanel";
import Cookies from "js-cookie";

// --- Types -------------------------------------------------------------------

interface Participant {
  id: number;
  name: string;
  avatar: string;
  status: "READY" | "WAITING" | "OFFLINE";
}

export interface Participants {
  id: string;
  name: string;
  avatar: string;
  ready: boolean;
  isEliminated?: boolean;
  isConnected?: boolean;
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

// --- Mock Data ----------------------------------------------------------------

const PARTICIPANTS: Participant[] = [
  { id: 1, name: "Savan Nguyen", avatar: "SN", status: "READY" },
  { id: 2, name: "Darrell Steward", avatar: "DS", status: "READY" },
  { id: 3, name: "Jane Cooper", avatar: "JC", status: "READY" },
  { id: 4, name: "Esther Howard", avatar: "EH", status: "READY" },
  { id: 5, name: "Jerome Bell", avatar: "JB", status: "READY" },
  { id: 6, name: "Annette Black", avatar: "AB", status: "READY" },
  { id: 7, name: "Ronald Richards", avatar: "RR", status: "READY" },
  { id: 8, name: "Eleanor Pena", avatar: "EP", status: "READY" },
];

const AVATAR_COLORS: Record<number, string> = {
  1: "from-orange-400 to-rose-500",
  2: "from-sky-400 to-indigo-500",
  3: "from-emerald-400 to-teal-500",
  4: "from-violet-400 to-purple-500",
  5: "from-amber-400 to-orange-500",
  6: "from-pink-400 to-rose-500",
  7: "from-cyan-400 to-blue-500",
  8: "from-lime-400 to-green-500",
};

// --- Default Questions --------------------------------------------------------

interface DefaultQuestion {
  id: string;
  label: string;
  question: string;
}

const DEFAULT_QUESTIONS: DefaultQuestion[] = [
  {
    id: "a",
    label: "A",
    question: "What was the most embarrassing thing that has happened to you?",
  },
  {
    id: "b",
    label: "B",
    question: "What is your biggest goal in life?",
  },
  {
    id: "c",
    label: "C",
    question: "What do you look for most in a potential lover?",
  },
  {
    id: "d-parent",
    label: "D-i",
    question: "How would you describe yourself as a Parent?",
  },
  {
    id: "d-lover",
    label: "D-ii",
    question: "How would you describe yourself as a Lover?",
  },
  {
    id: "d-employee",
    label: "D-iii",
    question: "How would you describe yourself as an Employee?",
  },
  {
    id: "d-person",
    label: "D-iv",
    question: "How would you describe yourself as a Person?",
  },
  {
    id: "d-friend",
    label: "D-v",
    question: "How would you describe yourself as a Friend?",
  },
  {
    id: "e",
    label: "E",
    question: "What is your biggest (personal) red flag?",
  },
  {
    id: "f",
    label: "F",
    question: "What is your favorite activity to do on a day off?",
  },
  {
    id: "g",
    label: "G",
    question: "How would your friends describe you?",
  },
  {
    id: "h",
    label: "H",
    question: "What is the craziest thing you have ever done?",
  },
  {
    id: "i",
    label: "I",
    question: "What do you get passionate about?",
  },
  {
    id: "j",
    label: "J",
    question: "Who do you look up to/admire?",
  },
];

// --- Sub-components -----------------------------------------------------------

function StatusBadge({ status }: { status: Participant["status"] }) {
  const colors = {
    READY: "text-emerald-400 bg-emerald-400/10 border border-emerald-400/30",
    WAITING: "text-amber-400  bg-amber-400/10  border border-amber-400/30",
    OFFLINE: "text-zinc-500   bg-zinc-500/10   border border-zinc-500/30",
  };
  return (
    <span
      className={`text-[10px] sm:text-xs font-bold tracking-widest px-2 py-0.5 rounded-full ${colors[status]}`}
    >
      {status}
    </span>
  );
}

function ParticipantRow({ p, index }: { p: Participant; index: number }) {
  return (
    <div
      className="flex items-center gap-3 py-2.5 px-3 rounded-xl transition-all duration-200
                 hover:bg-white/5 group cursor-default"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Avatar */}
      <div
        className={`relative flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-full
                    bg-gradient-to-br ${AVATAR_COLORS[p.id]}
                    flex items-center justify-center text-white text-xs font-bold
                    ring-2 ring-white/10 group-hover:ring-white/20 transition-all`}
      >
        {p.avatar}
        {/* Online dot */}
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-[#1a0a0a]" />
      </div>

      {/* Name */}
      <span className="flex-1 text-sm sm:text-[15px] font-medium text-zinc-200 group-hover:text-white transition-colors truncate">
        {p.name}
      </span>

      {/* Status */}
      <StatusBadge status={p.status} />
    </div>
  );
}

// --- Default Questions Picker -------------------------------------------------

function DefaultQuestionsPicker({
  onSelect,
}: {
  onSelect: (q: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl
                   border border-zinc-700/60 bg-zinc-900/80 backdrop-blur-sm
                   text-zinc-300 text-sm font-semibold tracking-wide
                   hover:border-red-700/60 hover:text-white hover:bg-zinc-800/80
                   transition-all duration-200 select-none"
      >
        {/* List icon */}
        <svg
          className="w-4 h-4 flex-shrink-0"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path strokeLinecap="round" d="M4 6h12M4 10h12M4 14h7" />
        </svg>
        Default Questions
        {/* Chevron */}
        <svg
          className={`w-3.5 h-3.5 flex-shrink-0 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6l4 4 4-4" />
        </svg>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          className="absolute bottom-full mb-2 left-0 z-50
                     w-[320px] sm:w-[380px] max-h-[400px] overflow-y-auto
                     rounded-2xl border border-red-900/40
                     bg-gradient-to-b from-[#1a0505]/95 to-[#110303]/95
                     backdrop-blur-md shadow-[0_-8px_40px_rgba(180,20,20,0.2)]
                     flex flex-col"
          style={{ scrollbarWidth: "thin" }}
        >
          {/* Header */}
          <div className="sticky top-0 px-4 pt-4 pb-3 border-b border-white/5 bg-[#1a0505]/80 backdrop-blur-sm">
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-red-400/80">
              Select a Default Question
            </p>
            <p className="text-[10px] text-zinc-600 mt-0.5">
              Click to fill the question box
            </p>
          </div>

          {/* List */}
          <div className="p-2 flex flex-col gap-0.5">
            {DEFAULT_QUESTIONS.map((dq) => (
              <button
                key={dq.id}
                type="button"
                onClick={() => {
                  onSelect(dq.question);
                  setOpen(false);
                }}
                className="flex items-start gap-3 w-full text-left px-3 py-2.5 rounded-xl
                           hover:bg-red-900/20 hover:border-red-800/30
                           border border-transparent
                           group transition-all duration-150"
              >
                {/* Label badge */}
                <span
                  className="flex-shrink-0 mt-0.5 w-6 h-6 rounded-md bg-red-900/40 border border-red-800/40
                             flex items-center justify-center text-[10px] font-black text-red-400
                             group-hover:bg-red-800/50 group-hover:text-red-300 transition-colors"
                >
                  {dq.label}
                </span>
                {/* Question text */}
                <span className="text-sm text-zinc-400 group-hover:text-zinc-100 leading-snug transition-colors">
                  {dq.question}
                </span>
              </button>
            ))}
          </div>

          {/* Bottom glow accent */}
          <div className="sticky bottom-0 h-8 bg-gradient-to-t from-[#110303]/80 to-transparent pointer-events-none" />
        </div>
      )}
    </div>
  );
}

// --- Main Component -----------------------------------------------------------

export default function Questions() {
  const [question, setQuestion] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const router = useRouter();
  const token = Cookies.get("accessToken") || "";

  // Fix 1: state type matches what mapServerPlayers returns
  const [participants, setParticipants] = useState<Participants[]>([]);

  const { sendEvent, isConnected } = useSocket({
    GAME_EVENT: (payload) => {
      console.log("🎮 Game Event received:", payload);
    },
  });

  const handleSend = async () => {
    if (!question.trim()) return;

    setSending(true);

    sendEvent(
      "GAME_EVENT",
      {
        gameId: "internet-bachelor-123",
        type: "SEND_QUESTION",
        payload: {
          question: question.trim(),
        },
      },
      (response) => {
        console.log("✅ Server ACK:", response);
        setSending(false);
        setSent(true);

        setTimeout(() => {
          router.push(`/round/two?x-token=${encodeURIComponent(token)}`);
        }, 1500);
      },
    );
  };

  const readyCount = PARTICIPANTS.filter((p) => p.status === "READY").length;

  return (
    /* -- Page shell -- */
    <div
      className="min-h-screen w-full flex flex-col items-center justify-start
                 overflow-hidden"
    >
      {/* -- Top bar -- */}
      <header className="w-full max-w-7xl px-4 sm:px-6 pt-5 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-red-400/80 text-xs font-semibold tracking-widest uppercase">
            <p> {isConnected() ? "🟢 Connected" : "🔴 Disconnected"}</p>
          </span>
        </div>
        <div className="text-zinc-600 text-xs">
          {readyCount}/{PARTICIPANTS.length} Ready
        </div>
      </header>

      {/* -- Hero title -- */}
      <div className="w-full max-w-6xl px-4 sm:px-6 pt-6 pb-8 text-center">
        <h1
          className="text-3xl sm:text-4xl md:text-5xl font-black tracking-[0.15em] uppercase
                     text-white drop-shadow-[0_0_30px_rgba(220,38,38,0.4)]"
          style={{ fontFamily: "'Georgia', serif", letterSpacing: "0.12em" }}
        >
          Round 1 — Questions
        </h1>
        <p className="mt-3 text-sm sm:text-base text-zinc-400 tracking-widest uppercase font-medium">
          Next Match-Up: <span className="text-red-400 font-bold">P1</span>
          <span className="text-zinc-500 mx-1">vs</span>
          <span className="text-red-400 font-bold">P2</span>
        </p>

        {/* Decorative divider */}
        <div className="mt-5 flex items-center justify-center gap-3">
          <div className="h-px w-16 sm:w-32 bg-gradient-to-r from-transparent to-red-700/60" />
          <div className="w-1.5 h-1.5 rotate-45 bg-red-600" />
          <div className="h-px w-16 sm:w-32 bg-gradient-to-l from-transparent to-red-700/60" />
        </div>
      </div>

      {/* -- Main content grid -- */}
      <main
        className="w-full max-w-7xl px-4 sm:px-6 pb-12
                   grid grid-cols-1 lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_380px]
                   gap-5 sm:gap-6"
      >
        {/* -- Left: Question panel -- */}
        <section className="flex flex-col gap-5">
          {/* Textarea card */}
          <div
            className="relative rounded-2xl overflow-hidden
                       border border-red-800/50 bg-black/30 backdrop-blur-sm
                       shadow-[0_0_40px_rgba(180,20,20,0.12)]"
          >
            {/* Glowing top edge */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-600/60 to-transparent" />

            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Write your question here…"
              rows={6}
              className="w-full bg-transparent resize-none p-5 sm:p-6 text-sm sm:text-base
                         text-zinc-200 placeholder:text-zinc-600
                         focus:outline-none leading-relaxed"
              style={{ fontFamily: "'Georgia', serif" }}
            />

            {/* Character count */}
            <div className="px-5 sm:px-6 pb-3 flex justify-end">
              <span
                className={`text-xs font-mono transition-colors ${
                  question.length > 280 ? "text-red-400" : "text-zinc-600"
                }`}
              >
                {question.length} / 300
              </span>
            </div>
          </div>

          {/* -- Action row: Default Questions + Send -- */}
          <div className="flex items-center justify-center gap-3 flex-wrap">
            {/* Default Questions picker — opens upward */}
            <DefaultQuestionsPicker onSelect={(q) => setQuestion(q)} />

            {/* Send button */}
            <Button
              variant="game"
              onClick={handleSend}
              disabled={sending || !question.trim()}
            >
              {sending ? (
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeDasharray="20 40"
                    />
                  </svg>
                  Sending…
                </span>
              ) : sent ? (
                "✓ Sent to Contestants!"
              ) : (
                "Send to Contestants"
              )}
            </Button>
          </div>

          {/* Info cards row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-1">
            {[
              { label: "Round", value: "1 of 5" },
              { label: "Time", value: "02:00" },
              { label: "Points", value: "100 pts" },
            ].map((card) => (
              <div
                key={card.label}
                className="rounded-xl border border-white/5 bg-white/3 backdrop-blur-sm
                           p-3 sm:p-4 flex flex-col gap-1 text-center"
              >
                <span className="text-[10px] sm:text-xs text-zinc-500 uppercase tracking-widest">
                  {card.label}
                </span>
                <span className="text-base sm:text-lg font-bold text-zinc-200">
                  {card.value}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* -- Right: Participants panel -- */}
        <ParticipantPanel />
      </main>
    </div>
  );
}
