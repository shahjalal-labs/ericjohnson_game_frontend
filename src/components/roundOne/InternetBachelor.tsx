

"use client";

import Button from "@/components/share/ButtonPrimary";
import Image from "next/image";
import RingImg from "@/assets/rings.png";
import TitleImage from "@/assets/IB 19.png";
import { useState, useEffect, useRef, useCallback } from "react";
import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSocket } from "@/hooks/useSocket";
import ParticipantPanel from "./Participantpanel";
import { useSocketSync } from "@/hooks/useSocketSync";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import Swal from "sweetalert2";
import { useUseTokenMutation } from "@/redux/api/tokenApi";
import Cookies from "js-cookie";

// --- Types --------------------------------------------------------------------
type Screen = "lobby" | "video" | "spectating";

export interface Participant {
  id: string;
  name: string;
  avatar: string;
  isReady: boolean;
  isEliminated: boolean;
  isConnected: boolean;
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

// --- Helpers ------------------------------------------------------------------
function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

// export function mapServerPlayers(players: ServerPlayer[]): Participant[] {
//   return players.map((p) => {
//     const displayName = p.username ?? p.name ?? `Player ${p.id.slice(-4)}`;
//     return {
//       id: p.id,
//       name: displayName,
//       avatar: getInitials(displayName),
//       ready: p.ready,
//       isEliminated: p.isEliminated,
//       isConnected: p.isConnected,
//     };
//   });
// }

export function mapServerPlayers(players: ServerPlayer[]): Participant[] {
  return players.map((p) => {
    const displayName = p.username ?? p.name ?? `Player ${p.id.slice(-4)}`;

    return {
      id: p.id,
      name: displayName,
      avatar: getInitials(displayName),
      isReady: p.isReady,
      isEliminated: p.isEliminated,
      isConnected: p.isConnected,
    };
  });
}

const token = Cookies.get("accessToken") || null;

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

// --- Sub-components -----------------------------------------------------------
export function AvatarBubble({
  initials,
  index,
  size = "md",
  ring = false,
  dimmed = false,
}: {
  initials: string;
  index: number;
  size?: "sm" | "md" | "lg";
  ring?: boolean;
  dimmed?: boolean;
}) {
  const sizeClasses = {
    sm: "w-9 h-9 text-xs",
    md: "w-11 h-11 text-sm",
    lg: "w-14 h-14 text-base",
  };
  return (
    <div
      className={`
        ${sizeClasses[size]} rounded-full bg-gradient-to-br
        ${AVATAR_COLORS[index % AVATAR_COLORS.length]}
        flex items-center justify-center font-bold text-white flex-shrink-0
        ${ring ? "ring-2 ring-amber-400/60 ring-offset-1 ring-offset-black" : ""}
        ${dimmed ? "opacity-40 grayscale" : ""}
        shadow-lg transition-all duration-300
      `}
    >
      {initials}
    </div>
  );
}

function RoseIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <ellipse cx="32" cy="28" rx="14" ry="16" fill="#e11d48" opacity="0.9" />
      <ellipse cx="22" cy="22" rx="9" ry="11" fill="#fb7185" opacity="0.7" />
      <ellipse cx="42" cy="22" rx="9" ry="11" fill="#fb7185" opacity="0.7" />
      <ellipse cx="32" cy="18" rx="8" ry="10" fill="#fda4af" opacity="0.6" />
      <rect x="30" y="40" width="4" height="18" fill="#15803d" rx="2" />
      <ellipse
        cx="26"
        cy="50"
        rx="8"
        ry="4"
        fill="#15803d"
        opacity="0.6"
        transform="rotate(-20 26 50)"
      />
    </svg>
  );
}

// --- Active Contestants Strip -------------------------------------------------
function ContestantStrip({
  participants,
  showOnlineIndicator = false,
}: {
  participants: Participant[];
  showOnlineIndicator?: boolean;
}) {
  const active = participants.filter((p) => !p.isEliminated);

  return (
    <div className="text-center">
      <p className="text-white/30 text-xs uppercase tracking-widest mb-3">
        Active Contestants ({active.length}/{participants.length})
      </p>
      {participants.length === 0 ? (
        <p className="text-white/30 text-sm italic">No participants yet</p>
      ) : (
        <div className="flex items-center justify-center flex-wrap gap-2">
          {participants.map((p, i) => (
            <div key={p.id} className="relative">
              <AvatarBubble
                initials={p.avatar}
                index={i}
                size="sm"
                ring={!p.isEliminated}
                dimmed={p.isEliminated}
              />
              {showOnlineIndicator && (
                <span
                  className={`absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full border border-black ${p.isConnected ? "bg-emerald-400" : "bg-red-500"
                    }`}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// --- Screen 1: Host Lobby -----------------------------------------------------
function LobbyScreen({
  onStart,
  participants,
}: {
  onStart: () => void;
  participants: Participant[];
}) {
  const router = useRouter();
  const readyCount = participants.filter((p) => p.isReady).length;
  const connectedCount = participants.filter(
    (p) => p.isConnected !== false,
  ).length;
  const { sendEvent, isConnected } = useSocket({
    GAME_EVENT: (payload) => {
      console.log("🎮 Game Event received:", payload);
    },
  });
  const [useToken, { isLoading: isTokenLoading }] = useUseTokenMutation();

  const handleStartGame = () => {
    sendEvent(
      "GAME_EVENT",
      {
        gameId: "internet-bachelor-123",
        type: "START_GAME",
        payload: {},
      },
      async (response) => {
        console.log("✅ Server ACK:", response);
        if (response.success) {
          try {
            const res = await useToken({}).unwrap();
            if (res && res.success === false) {
              toast.warning(res.message || "Failed to use token");
              return;
            }
            router.push(`/round/one?x-token=${token}`);
          } catch (err: any) {
            toast.warning(err?.data?.message || err?.message || "Failed to use token");
          }
        } else {
          toast.warning(response.message);
        }
      },
    );
  };

  return (
    <div className="flex flex-col lg:flex-row gap-5 w-full max-w-7xl mx-auto px-4">
      {/* Main card */}
      <div className="flex-1 rounded-2xl border border-amber-500/30 bg-gradient-to-br from-black/80 to-rose-950/40 backdrop-blur-sm p-6 sm:p-10 flex flex-col items-center justify-center gap-6 min-h-[340px]">
        <div className="text-center">
          <p className="text-white/50 uppercase tracking-[0.3em] text-xs font-semibold mb-1">
            Status
          </p>
          <h2 className="text-white font-extrabold text-lg sm:text-xl tracking-widest uppercase mb-1">
            Waiting for Contestants{" "}
            <span className="text-amber-400">
              ({readyCount}/{participants.length})
            </span>
          </h2>
          {participants.length > 0 && (
            <p className="text-white/40 text-xs">{connectedCount} connected</p>
          )}
        </div>

        <Button variant="game" onClick={handleStartGame} disabled={isTokenLoading}>
          {isTokenLoading ? "STARTING..." : "▶ START GAME"}
        </Button>

        <p className="text-white/70 text-xs text-center max-w-xs mt-4">
          Minimum 2 players required for testing &nbsp;·&nbsp; 8 players
          required for the full game
        </p>

        <div>
          <Image
            src={RingImg}
            alt="rings"
            width={200}
            height={200}
            unoptimized
          />
        </div>
      </div>

      {/* Participants panel */}
      <ParticipantPanel />
    </div>
  );
}

// --- Screen 2: Video Intro ----------------------------------------------------
const DEFAULT_VIDEO_SRC = "/videos/IB_2.mp4";

function VideoScreen({
  onAdvance,
  participants,
}: {
  onAdvance: () => void;
  participants: Participant[];
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [showEnded, setShowEnded] = useState(false);
  const [countdown, setCountdown] = useState(3);

  const CIRCUMFERENCE = 2 * Math.PI * 24;

  const advance = useCallback(() => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    setShowEnded(false);
    onAdvance();
  }, [onAdvance]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.play().catch(() => { });
  }, []);

  function handleCanPlay() {
    setIsLoading(false);
    videoRef.current?.play().catch(() => { });
  }

  useEffect(() => {
    if (!showEnded) return;
    let count = 3;
    setCountdown(count);
    countdownRef.current = setInterval(() => {
      count -= 1;
      setCountdown(count);
      if (count <= 0) advance();
    }, 1000);
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [showEnded, advance]);

  function handlePlayPause() {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
    } else {
      videoRef.current.pause();
    }
  }

  function handleTimeUpdate() {
    const v = videoRef.current;
    if (!v) return;
    const dur = v.duration || 0;
    const cur = v.currentTime || 0;
    setCurrentTime(cur);
    setDuration(dur);
    setProgress(dur ? (cur / dur) * 100 : 0);
  }

  function handleProgressClick(e: React.MouseEvent<HTMLDivElement>) {
    const v = videoRef.current;
    if (!v) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    v.currentTime = pct * (v.duration || 0);
  }

  function handleSpeedChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = parseFloat(e.target.value);
    setSpeed(val);
    if (videoRef.current) videoRef.current.playbackRate = val;
  }

  function handleEnded() {
    setIsPlaying(false);
    setShowEnded(true);
  }

  function fmt(s: number) {
    s = Math.floor(s || 0);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  }

  const strokeOffset = CIRCUMFERENCE - ((3 - countdown) / 3) * CIRCUMFERENCE;
  const activePlayers = participants.filter((p) => !p.isEliminated);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 flex flex-col gap-4">
      {/* Video wrapper */}
      <div className="relative rounded-2xl bg-black overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 bg-black flex flex-col items-center justify-center gap-5 z-10">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-2 border-white/10" />
              <div className="absolute inset-0 rounded-full border-2 border-t-amber-400 border-r-rose-500 border-b-transparent border-l-transparent animate-spin" />
            </div>
            <p className="text-white/50 text-xs uppercase tracking-[0.3em] font-semibold">
              Loading video...
            </p>
          </div>
        )}

        <video
          ref={videoRef}
          src={DEFAULT_VIDEO_SRC}
          className="w-full max-h-[80vh] object-cover bg-black"
          onCanPlay={handleCanPlay}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
          playsInline
        />

        {showEnded && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center gap-4">
            <span className="text-5xl animate-bounce">🌹</span>
            <p className="text-amber-400 font-extrabold text-lg uppercase tracking-widest">
              Video Complete!
            </p>
            <div className="relative w-14 h-14">
              <svg className="absolute inset-0 -rotate-90" viewBox="0 0 56 56">
                <circle
                  cx="28"
                  cy="28"
                  r="24"
                  fill="none"
                  stroke="rgba(245,158,11,0.2)"
                  strokeWidth="4"
                />
                <circle
                  cx="28"
                  cy="28"
                  r="24"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="4"
                  strokeDasharray={CIRCUMFERENCE}
                  strokeDashoffset={strokeOffset}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-amber-400 font-black text-lg">
                {countdown}
              </span>
            </div>
            <p className="text-white/40 text-xs tracking-widest">
              Advancing to spectating...
            </p>
          </div>
        )}
      </div>

      {/* Controls bar */}
      <div className="rounded-2xl border border-amber-500/20 bg-black/70 backdrop-blur-sm px-5 py-4 flex items-center gap-4 flex-wrap">
        <button
          onClick={handlePlayPause}
          className="w-10 h-10 rounded-full border border-amber-400/40 bg-amber-400/10 text-amber-400 flex items-center justify-center text-sm hover:bg-amber-400/20 transition-colors flex-shrink-0"
        >
          {isPlaying ? "⏸" : "▶"}
        </button>

        <div className="flex-1 min-w-[120px] flex flex-col gap-1">
          <div
            className="w-full h-1 bg-white/10 rounded-full cursor-pointer relative"
            onClick={handleProgressClick}
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 to-rose-500 pointer-events-none"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-white/40 text-[10px] tracking-wide">
            {fmt(currentTime)} / {fmt(duration)}
          </span>
        </div>

        <select
          value={speed}
          onChange={handleSpeedChange}
          className="bg-black/60 border border-amber-400/40 text-amber-400 rounded-lg px-2 py-1.5 text-xs font-bold tracking-wider cursor-pointer flex-shrink-0"
        >
          <option value={0.5}>0.5×</option>
          <option value={1}>1×</option>
          <option value={1.5}>1.5×</option>
          <option value={2}>2×</option>
          <option value={3}>3×</option>
        </select>

        <Button variant="game" onClick={advance}>
          ⏭ Skip
        </Button>
      </div>

      <ContestantStrip participants={activePlayers} showOnlineIndicator />
    </div>
  );
}

// --- Screen 3: Spectating -----------------------------------------------------
function SpectatingScreen({ participants }: { participants: Participant[] }) {
  const question = '"CONNECTED TO LOBBY"';
  const [charIdx, setCharIdx] = useState(0);
  const router = useRouter();

  useEffect(() => {
    if (charIdx < question.length) {
      const t = setTimeout(() => setCharIdx((c) => c + 1), 40);
      return () => clearTimeout(t);
    }
  }, [charIdx, question.length]);

  const activePlayers = participants.filter((p) => !p.isEliminated);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 flex flex-col gap-6">
      <p className="text-white/40 uppercase tracking-[0.25em] text-xs font-semibold">
        Contestant 1
      </p>

      <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-black/90 to-rose-950/50 backdrop-blur-sm p-8 sm:p-14 flex flex-col items-center gap-8 min-h-[280px] justify-center">
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

        <Button variant="game" onClick={() => router.push(`/round/one?x-token=${token}`)}>
          Write the question
        </Button>
      </div>

      <ContestantStrip participants={activePlayers} />
    </div>
  );
}

// --- Navigation Tabs ----------------------------------------------------------
function NavTabs({
  current,
  onChange,
}: {
  current: Screen;
  onChange: (s: Screen) => void;
}) {
  const tabs: { id: Screen; label: string }[] = [
    { id: "lobby", label: "Host Lobby" },
    { id: "video", label: "Video Intro" },
    { id: "spectating", label: "Spectating" },
  ];
  return (
    <div className="flex items-center gap-1 bg-white/5 rounded-full p-1 border border-white/10">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 ${current === t.id
            ? "bg-rose-600 text-white shadow-lg shadow-rose-900/60"
            : "text-white/40 hover:text-white/70"
            }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

// --- Main Component -----------------------------------------------------------
export default function InternetBachelor() {
  useSocketSync();
  const [screen, setScreen] = useState<Screen>("lobby");
  const participants = useSelector((state: RootState) => state.participants.players);
  const router = useRouter();


  const { sendEvent, isConnected } = useSocket({
    GAME_EVENT: (payload) => {
      console.log("🎮 Game Event received:", payload);

      switch (payload.type) {
        case "PLAYERS_UPDATE": {
          // Handled by useSocketSync globally
          break;
        }

        case "GAME_STARTED":
          console.log("Game started!");
          setScreen("video");
          break;

        case "ROSE_GIVEN":
          console.log("Rose given!");
          break;

        default:
          console.log("Unknown event:", payload);
      }
    },
  });

  useEffect(() => {
    // Push dummy state to intercept back button
    window.history.pushState(null, "", window.location.href);

    const handlePopState = () => {
      // Push dummy state again to prevent going back immediately
      window.history.pushState(null, "", window.location.href);

      Swal.fire({
        title: "Quit Game?",
        text: "Are you sure you want to quit? This will end the game for everyone.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, quit game!",
        background: "#1A0500",
        color: "#fff"
      }).then((result) => {
        if (result.isConfirmed) {
          sendEvent("GAME_EVENT", {
            gameId: "internet-bachelor-123",
            type: "GAME_ENDED",
            payload: {}
          });
          router.push("/");
        }
      });
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [router, sendEvent]);

  const connected = isConnected();
  const screenTitle =
    screen === "lobby"
      ? "Lobby"
      : screen === "video"
        ? "Video Intro"
        : "Live Duel";

  return (
    <div className="">
      {/* Vignette */}
      <div className="bg-radial-[ellipse_at_center] from-transparent via-transparent to-black/70 pointer-events-none" />

      {/* -- Header -- */}
      <div className="text-center pt-12 relative">
        <div className="flex justify-center">
          <Image src={TitleImage} alt="title" priority />
        </div>
        <p className="text-white uppercase text-2xl -mt-3 font-semibold">
          {screenTitle}
        </p>
        {/* Connection indicator */}
        <div className="flex items-center justify-center gap-1.5 mt-1">
          <span
            className={`w-1.5 h-1.5 rounded-full ${connected ? "bg-emerald-400 animate-pulse" : "bg-red-500"
              }`}
          />
          <span className="text-white/30 text-[10px] uppercase tracking-widest">
            {connected ? "Live" : "Disconnected"}
          </span>
        </div>
      </div>

      {/* -- Screen Nav -- */}
      {/* <div className="relative z-10 flex justify-center pt-5 pb-2 px-4">
        <NavTabs current={screen} onChange={setScreen} />
      </div> */}

      {/* -- Main Content -- */}
      <div className="relative z-10 flex flex-col items-center justify-center py-10 px-2">
        <div className="w-full">
          {screen === "lobby" && (
            <LobbyScreen
              onStart={() => setScreen("video")}
              participants={participants}
            />
          )}
          {screen === "video" && (
            <VideoScreen
              onAdvance={() => setScreen("spectating")}
              participants={participants}
            />
          )}
          {screen === "spectating" && (
            <SpectatingScreen participants={participants} />
          )}
        </div>
      </div>

      {/* Decorative roses */}
      <div
        className="fixed bottom-8 left-8 opacity-10 pointer-events-none hidden lg:block"
        aria-hidden
      >
        <RoseIcon className="w-24 h-24" />
      </div>
      <div
        className="fixed top-24 right-12 opacity-8 pointer-events-none hidden lg:block rotate-12"
        aria-hidden
      >
        <RoseIcon className="w-16 h-16" />
      </div>
    </div>
  );
}
