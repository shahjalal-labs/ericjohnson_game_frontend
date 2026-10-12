"use client";

import Button from "@/components/share/ButtonPrimary";
import Cookies from "js-cookie";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";

// --- Types --------------------------------------------------------------------
interface Player {
  id: number;
  name: string;
  label: string;
  score1: number;
  score2: number;
  muted: boolean;
  image: string;
  isCrownWinner: boolean;
  avatarColor: string;
  initials: string;
}

// --- Mock data ----------------------------------------------------------------
const PLAYERS: Player[] = [
  {
    id: 1,
    name: "Cassie Jung",
    label: "PLAYER 1",
    score1: 161.19,
    score2: 37.57,
    muted: true,
    image:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face",
    isCrownWinner: true,
    avatarColor: "#1e3a5f",
    initials: "CJ",
  },
  {
    id: 7,
    name: "Robert Bruce",
    label: "PLAYER 7",
    score1: 0,
    score2: 0,
    muted: true,
    image:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop&crop=face",
    isCrownWinner: true,
    avatarColor: "#5c3317",
    initials: "RB",
  },
];

// --- Pulse ring component -----------------------------------------------------
function PulseRing() {
  return (
    <span className="relative flex h-2.5 w-2.5">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
    </span>
  );
}

// --- Audio-bar visualiser ------------------------------------------------------
function AudioBars() {
  return (
    <div className="flex items-end gap-[2px] h-5">
      {[3, 5, 8, 5, 3, 6, 4].map((h, i) => (
        <span
          key={i}
          className="w-[3px] rounded-sm bg-white/80"
          style={{
            height: `${h * 2}px`,
            animation: `audioBounce ${0.4 + i * 0.07}s ease-in-out infinite alternate`,
            animationDelay: `${i * 60}ms`,
          }}
        />
      ))}
    </div>
  );
}

// --- Timer hook ---------------------------------------------------------------
function useTimer(initial = 24 * 3600 + 1 * 60 + 45) {
  const [secs, setSecs] = useState(initial);
  useEffect(() => {
    const id = setInterval(() => setSecs((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, []);
  const h = String(Math.floor(secs / 3600)).padStart(2, "0");
  const m = String(Math.floor((secs % 3600) / 60)).padStart(2, "0");
  const s = String(secs % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}



// --- Player card --------------------------------------------------------------
function PlayerCard({ player }: { player: Player }) {
  const [muted, setMuted] = useState(player.muted);
  const router = useRouter();
  const token = Cookies.get("accessToken") || null;

  return (
    <div className="relative rounded-2xl overflow-hidden border border-white/10 flex-1 min-w-[220px]">
      {/* Label row */}
      <div className="flex justify-center py-2.5 px-4">
        <span
          className="text-xs font-bold tracking-[0.2em] uppercase"
          style={{ color: "#c0c0d8", fontFamily: "'Rajdhani', sans-serif" }}
        >
          {player.label}
        </span>
      </div>

      {/* Avatar block */}
      <div className="relative mx-3 rounded-xl overflow-hidden aspect-[4/3]">
        {/* Gradient avatar background */}
        {/* <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ background: player.avatarColor }}
        >
          <span
            className="text-5xl font-black text-white/30 select-none"
            style={{ fontFamily: "'Rajdhani', sans-serif" }}
          >
            {player.initials}
          </span>
        </div> */}
        {/* Player Image */}
        <Image
          src={player.image}
          alt={player.name}
          fill
          priority
          className="object-cover"
        />

        {/* Overlay (optional for dark effect) */}
        <div className="absolute inset-0 bg-black/30" />

        {/* Fallback initials if no image */}
        {!player.image && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: player.avatarColor }}
          >
            <span className="text-5xl font-black text-white/30 select-none">
              {player.initials}
            </span>
          </div>
        )}

        {/* Simulated photo overlay – gradient mesh */}
        <div
          className="absolute inset-0 opacity-60"
          style={{
            background: `radial-gradient(ellipse at 40% 30%, ${player.avatarColor}aa 0%, transparent 70%)`,
          }}
        />

        {/* Name chip */}
        <div className="absolute bottom-2 left-2">
          <span
            className="text-xs font-semibold text-white bg-black/50 backdrop-blur-sm px-2.5 py-1 rounded-lg"
            style={{
              fontFamily: "'Rajdhani', sans-serif",
              letterSpacing: "0.05em",
            }}
          >
            {player.name}
          </span>
        </div>
      </div>

      {/* Crown winner badge */}

      <div className="flex justify-center my-4  px-3">
        <Button
          variant="game"
          onClick={() => router.push(`/round-two/round-two-six?x-token=${token}`)}
        >
          <svg
            className="w-3.5 h-3.5 text-yellow-300"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          Crown Winner
        </Button>
      </div>

      {/* Scores */}
      {player.score1 > 0 && (
        <div className="flex justify-center gap-2 pb-3 px-3">
          <span
            className="flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full"
            style={{
              background: "linear-gradient(90deg,#6d28d9,#7c3aed)",
              color: "#e9d5ff",
              fontFamily: "'Rajdhani', sans-serif",
            }}
          >
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                clipRule="evenodd"
              />
            </svg>
            {player.score1.toFixed(2)}
          </span>
          <span
            className="flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full"
            style={{
              background: "linear-gradient(90deg,#1d4ed8,#2563eb)",
              color: "#bfdbfe",
              fontFamily: "'Rajdhani', sans-serif",
            }}
          >
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
            {player.score2.toFixed(2)}
          </span>
        </div>
      )}
    </div>
  );
}

// --- Main dashboard -----------------------------------------------------------
export default function VideoGrand() {
  const timer = useTimer();
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const router = useRouter();

  return (
    <>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;600;700&family=Orbitron:wght@400;700;900&display=swap');

        @keyframes audioBounce {
          from { transform: scaleY(0.4); opacity: 0.6; }
          to   { transform: scaleY(1);   opacity: 1;   }
        }
        @keyframes gradientShift {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes scanline {
          0%   { transform: translateY(-100%); }
          100% { transform: translateY(200%); }
        }
        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 0 16px 2px rgba(220,38,38,0.25); }
          50%       { box-shadow: 0 0 32px 6px rgba(220,38,38,0.55); }
        }
        .glow-border { animation: glowPulse 2.4s ease-in-out infinite; }
      `}</style>

      {/* Root */}
      <div className=" mt-5">
        {/* Card */}
        <div
          className="w-full max-w-5xl mx-auto rounded-3xl overflow-hidden"
          style={{
            background: "linear-gradient(160deg,#12111c 0%,#0c0b14 100%)",
            border: "1px solid rgba(220,38,38,0.18)",
            boxShadow:
              "0 32px 80px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.05)",
          }}
        >
          {/* Top bar */}
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <div className="flex items-center gap-2">
              <div
                className="w-1.5 h-6 rounded-full"
                style={{
                  background: "linear-gradient(180deg,#ef4444,#b91c1c)",
                }}
              />
              <span
                className="text-lg font-bold tracking-wide text-white"
                style={{
                  fontFamily: "'Orbitron', monospace",
                  letterSpacing: "0.08em",
                }}
              >
                Contestant 2
              </span>
            </div>
            <div className="flex items-center gap-2 text-white/30 text-xs">
              <span
                className="text-white/50 font-semibold"
                style={{
                  fontFamily: "'Orbitron', monospace",
                  fontSize: "11px",
                }}
              >
                LIVE ARENA
              </span>
              <div className="w-1 h-1 rounded-full bg-white/20" />
              <span className="text-white/30">HD</span>
            </div>
          </div>

          {/* Main video area */}

          <div className="px-2 sm:px-5">
            <div
              className="relative rounded-xl sm:rounded-2xl overflow-hidden glow-border"
              style={{
                border: "1.5px solid rgba(220,38,38,0.4)",
                aspectRatio: "16/9",
                minHeight: "180px",
                background: "#111",
              }}
            >
              {/* Fake "video" background */}
              {/* Background Image */}
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: "url('/videoCall.jpg')",
                }}
              />

              {/* Dark overlay (important for readability) */}
              <div className="absolute inset-0 bg-black/40" />

              {/* Scanline effect */}
              {/* <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.08) 2px,rgba(0,0,0,0.08) 4px)",
                }}
              /> */}

              {/* Centred host silhouette placeholder */}
              {/* <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3 opacity-30">
                  <svg
                    className="w-20 h-20 text-white/40"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                  </svg>
                  <span
                    className="text-xs text-white/50 tracking-widest uppercase"
                    style={{ fontFamily: "'Orbitron', monospace" }}
                  >
                    Video Feed
                  </span>
                </div>
              </div> */}

              {/* LIVE badge */}
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <div
                  className="flex items-center gap-1.5 bg-red-600 text-white text-xs font-black px-2.5 py-1 rounded-md tracking-wider"
                  style={{
                    fontFamily: "'Orbitron', monospace",
                    fontSize: "10px",
                  }}
                >
                  <PulseRing />
                  LIVE
                </div>
                <div
                  className="text-white text-sm font-bold bg-black/50 backdrop-blur-sm px-2.5 py-1 rounded-md"
                  style={{
                    fontFamily: "'Orbitron', monospace",
                    fontSize: "12px",
                  }}
                >
                  {timer}
                </div>
              </div>

              {/* Fullscreen btn */}
              <button
                onClick={() => setFullscreen((f) => !f)}
                className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                {fullscreen ? (
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 9V4.5M9 9H4.5M15 9h4.5M15 9V4.5M9 15v4.5M9 15H4.5M15 15h4.5M15 15v4.5"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
                    />
                  </svg>
                )}
              </button>

              {/* Name + audio chip */}
              <div className="absolute bottom-3 left-3 flex items-center gap-2">
                <div className="bg-black/60 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-lg tracking-wide">
                  Adam Joseph
                </div>
              </div>
              <div className="absolute bottom-3 right-3 w-9 h-9 rounded-xl bg-black/50 backdrop-blur-sm flex items-center justify-center">
                <AudioBars />
              </div>
            </div>
          </div>

          {/* Player cards row */}
          <div className="flex flex-col sm:flex-row gap-4 px-4 sm:px-5 mt-4">
            {PLAYERS.map((p) => (
              <PlayerCard key={p.id} player={p} />
            ))}
          </div>

          {/* Bottom control bar */}
          <div className="flex items-center justify-center gap-4 py-5 mt-2">
            {/* Mic */}
            <button
              onClick={() => setMicOn((v) => !v)}
              className="w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 active:scale-95"
              style={{
                background: micOn
                  ? "linear-gradient(135deg,#1f2937,#374151)"
                  : "linear-gradient(135deg,#991b1b,#b91c1c)",
                boxShadow: micOn
                  ? "0 4px 12px rgba(0,0,0,0.4)"
                  : "0 4px 16px rgba(220,38,38,0.5)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
              aria-label="Toggle microphone"
            >
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                {micOn ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                  />
                ) : (
                  <>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                    />
                    <line x1="4" y1="4" x2="20" y2="20" strokeLinecap="round" />
                  </>
                )}
              </svg>
            </button>

            {/* Camera */}
            <button
              onClick={() => setCamOn((v) => !v)}
              className="w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 active:scale-95"
              style={{
                background: camOn
                  ? "linear-gradient(135deg,#1f2937,#374151)"
                  : "linear-gradient(135deg,#991b1b,#b91c1c)",
                boxShadow: camOn
                  ? "0 4px 12px rgba(0,0,0,0.4)"
                  : "0 4px 16px rgba(220,38,38,0.5)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
              aria-label="Toggle camera"
            >
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                {camOn ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"
                  />
                ) : (
                  <>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"
                    />
                    <line x1="4" y1="4" x2="20" y2="20" strokeLinecap="round" />
                  </>
                )}
              </svg>
            </button>

            {/* End call */}
            <button
              className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 active:scale-95 hover:scale-105"
              style={{
                background: "linear-gradient(135deg,#dc2626,#b91c1c)",
                boxShadow: "0 4px 20px rgba(220,38,38,0.6)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
              aria-label="End call"
            >
              <svg
                className="w-5 h-5 text-white rotate-135"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
