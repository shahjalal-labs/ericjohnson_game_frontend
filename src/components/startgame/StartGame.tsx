"use client";

import { useSocket } from "@/hooks/useSocket";
import { useGetMyProfileQuery } from "@/redux/api/userApi";
import { clearPlayers } from "@/redux/features/sidePanel/participantsSlice";
import { resetGameOver } from "@/redux/features/winner/Gameoverslice";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Cookies from "js-cookie";

const DEFAULT_VIDEO_SRC = "/videos/intro.mp4";

type Role = "bachelor" | "contestant";

// -----------------------------------------------------------------------------
// ROUTING LOADING OVERLAY
// -----------------------------------------------------------------------------
function RouteLoadingOverlay({ role }: { role: Role }) {
  const [dots, setDots] = useState(0);
  const [phase, setPhase] = useState(0);

  const phases =
    role === "bachelor"
      ? [
        "Preparing your rose ceremony",
        "Setting the stage",
        "Starting your game",
      ]
      : ["Finding your place", "Getting you ready", "Joining the show"];

  useEffect(() => {
    const dotTimer = setInterval(() => setDots((d) => (d + 1) % 4), 400);
    const phaseTimer = setInterval(
      () => setPhase((p) => Math.min(p + 1, phases.length - 1)),
      900,
    );
    return () => {
      clearInterval(dotTimer);
      clearInterval(phaseTimer);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,#5C1A0060,transparent_70%)] pointer-events-none" />

      <div className="relative flex items-center justify-center mb-10">
        <div
          className="absolute w-36 h-36 rounded-full border border-amber-400/20 animate-ping"
          style={{ animationDuration: "1.8s" }}
        />
        <div
          className="absolute w-28 h-28 rounded-full border border-rose-500/30 animate-ping"
          style={{ animationDuration: "1.3s", animationDelay: "0.3s" }}
        />

        <svg
          className="absolute w-32 h-32 -rotate-90 animate-spin"
          style={{ animationDuration: "2s" }}
          viewBox="0 0 128 128"
        >
          <circle
            cx="64"
            cy="64"
            r="58"
            fill="none"
            stroke="rgba(245,158,11,0.1)"
            strokeWidth="3"
          />
          <circle
            cx="64"
            cy="64"
            r="58"
            fill="none"
            stroke="url(#arcG)"
            strokeWidth="3"
            strokeDasharray="364"
            strokeDashoffset="274"
            strokeLinecap="round"
          />
          <defs>
            <linearGradient id="arcG" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
          </defs>
        </svg>

        <svg
          className="absolute w-20 h-20"
          style={{ animation: "counterSpin 1.4s linear infinite" }}
          viewBox="0 0 80 80"
        >
          <circle
            cx="40"
            cy="40"
            r="34"
            fill="none"
            stroke="rgba(239,68,68,0.15)"
            strokeWidth="2"
          />
          <circle
            cx="40"
            cy="40"
            r="34"
            fill="none"
            stroke="#ef4444"
            strokeWidth="2"
            strokeDasharray="214"
            strokeDashoffset="160"
            strokeLinecap="round"
          />
        </svg>

        <span
          className="text-4xl z-10"
          style={{ animation: "rosePulse 1.8s ease-in-out infinite" }}
        >
          🌹
        </span>
      </div>

      <div className="flex flex-col items-center gap-3">
        <p className="text-amber-400 font-extrabold text-sm uppercase tracking-[0.35em]">
          {phases[phase]}
          {".".repeat(dots)}
        </p>
        <div className="w-56 h-[2px] bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full w-1/3 rounded-full bg-gradient-to-r from-amber-400 via-rose-500 to-amber-400"
            style={{ animation: "shimmerBar 1.6s ease-in-out infinite" }}
          />
        </div>
        <p className="text-white/25 text-[10px] tracking-[0.5em] uppercase mt-1">
          Please wait
        </p>
      </div>

      <style>{`
        @keyframes rosePulse {
          0%,100% { transform:scale(1);    filter:drop-shadow(0 0 10px rgba(239,68,68,.5)); }
          50%      { transform:scale(1.18); filter:drop-shadow(0 0 26px rgba(239,68,68,1)); }
        }
        @keyframes counterSpin { from{transform:rotate(90deg)} to{transform:rotate(-270deg)} }
        @keyframes shimmerBar  { 0%{transform:translateX(-200%)} 100%{transform:translateX(500%)} }
      `}</style>
    </div>
  );
}

// -----------------------------------------------------------------------------
// FULL-SCREEN VIDEO MODAL
// -----------------------------------------------------------------------------
interface VideoModalProps {
  role: Role;
  onFinish: () => void;
}

function VideoModal({ role, onFinish }: VideoModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const controlsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [showEnded, setShowEnded] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [showControls, setShowControls] = useState(true);

  const CIRCUMFERENCE = 2 * Math.PI * 24;

  // Auto-play
  useEffect(() => {
    videoRef.current?.play().catch(() => { });
  }, []);

  // Auto-hide controls after 3 s of inactivity
  const resetControlsTimer = useCallback(() => {
    setShowControls(true);
    if (controlsTimer.current) clearTimeout(controlsTimer.current);
    controlsTimer.current = setTimeout(() => setShowControls(false), 3000);
  }, []);

  useEffect(() => {
    resetControlsTimer();
    return () => {
      if (controlsTimer.current) clearTimeout(controlsTimer.current);
    };
  }, [resetControlsTimer]);

  const advance = useCallback(() => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    setShowEnded(false);
    onFinish();
  }, [onFinish]);

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

  function handleCanPlay() {
    setIsLoading(false);
    videoRef.current?.play().catch(() => { });
  }

  function handlePlayPause() {
    if (!videoRef.current) return;
    videoRef.current.paused
      ? videoRef.current.play()
      : videoRef.current.pause();
    resetControlsTimer();
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
    v.currentTime = ((e.clientX - rect.left) / rect.width) * (v.duration || 0);
    resetControlsTimer();
  }

  function handleSpeedChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = parseFloat(e.target.value);
    setSpeed(val);
    if (videoRef.current) videoRef.current.playbackRate = val;
    resetControlsTimer();
  }

  function handleEnded() {
    setIsPlaying(false);
    setShowEnded(true);
    setShowControls(true);
  }

  function fmt(s: number) {
    s = Math.floor(s || 0);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  }

  const strokeOffset = CIRCUMFERENCE - ((3 - countdown) / 3) * CIRCUMFERENCE;
  const endLabel =
    role === "bachelor" ? "Starting your game..." : "Joining the show...";

  return (
    /* Full viewport overlay */
    <div
      className="fixed inset-0 z-50 bg-black flex flex-col"
      onMouseMove={resetControlsTimer}
      onTouchStart={resetControlsTimer}
    >
      {/* -- Video fills entire screen -- */}
      <video
        ref={videoRef}
        src={DEFAULT_VIDEO_SRC}
        className="absolute inset-0 w-full h-full object-cover"
        onCanPlay={handleCanPlay}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        playsInline
        onClick={handlePlayPause}
      />

      {/* -- Loading spinner (centred over video) -- */}
      {isLoading && (
        <div className="absolute inset-0 bg-black flex flex-col items-center justify-center gap-5 z-20">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-2 border-white/10" />
            <div className="absolute inset-0 rounded-full border-2 border-t-amber-400 border-r-rose-500 border-b-transparent border-l-transparent animate-spin" />
          </div>
          <p className="text-white/50 text-xs uppercase tracking-[0.3em] font-semibold">
            Loading video...
          </p>
        </div>
      )}

      {/* -- Dark gradient at top (role badge + skip) -- */}
      <div
        className="absolute top-0 inset-x-0 z-30 flex items-center justify-between px-4 md:px-6 pt-4 md:pt-6 pb-16 transition-opacity duration-500"
        style={{
          opacity: showControls ? 1 : 0,
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.75) 0%, transparent 100%)",
        }}
      >
        {/* Role badge */}
        <span className="px-3 py-1 rounded-full border border-amber-400/40 bg-black/40 backdrop-blur-sm text-amber-400 text-[10px] md:text-[11px] font-bold uppercase tracking-widest">
          {role === "bachelor" ? "🌹 Bachelor" : "🎭 Contestant"}
        </span>

        {/* Skip button */}
        <button
          onClick={advance}
          className="px-3 md:px-4 py-1.5 md:py-2 rounded-xl border border-white/20 bg-black/40 backdrop-blur-sm text-white/80 text-[10px] md:text-xs font-bold tracking-wider hover:bg-white/10 transition-colors"
        >
          ⏭ Skip
        </button>
      </div>

      {/* -- Dark gradient at bottom (progress + controls) -- */}
      <div
        className="absolute bottom-0 inset-x-0 z-30 px-4 md:px-6 pb-4 md:pb-8 pt-16 transition-opacity duration-500"
        style={{
          opacity: showControls ? 1 : 0,
          background:
            "linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)",
        }}
      >
        {/* Progress bar */}
        <div
          className="w-full h-1 bg-white/20 rounded-full cursor-pointer mb-3 md:mb-4 group"
          onClick={handleProgressClick}
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-400 to-rose-500 relative pointer-events-none"
            style={{ width: `${progress}%` }}
          >
            {/* Scrubber dot */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-lg shadow-amber-400/50 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        {/* Controls row */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Play / Pause */}
          <button
            onClick={handlePlayPause}
            className="w-9 h-9 md:w-11 md:h-11 rounded-full border border-white/20 bg-black/40 backdrop-blur-sm text-white flex items-center justify-center text-sm md:text-base hover:bg-white/10 transition-colors flex-shrink-0"
          >
            {isPlaying ? "⏸" : "▶"}
          </button>

          {/* Timestamp */}
          <span className="text-white/60 text-[10px] md:text-xs tracking-wide tabular-nums flex-shrink-0">
            {fmt(currentTime)} / {fmt(duration)}
          </span>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Speed */}
          <select
            value={speed}
            onChange={handleSpeedChange}
            className="bg-black/50 border border-white/20 text-white/80 rounded-lg px-2 py-1 md:py-1.5 text-[10px] md:text-xs font-bold tracking-wider cursor-pointer flex-shrink-0 backdrop-blur-sm"
          >
            <option value={0.5}>0.5×</option>
            <option value={1}>1×</option>
            <option value={1.5}>1.5×</option>
            <option value={2}>2×</option>
            <option value={3}>3×</option>
          </select>
        </div>
      </div>

      {/* -- Video ended overlay -- */}
      {showEnded && (
        <div className="absolute inset-0 z-40 bg-black/70 flex flex-col items-center justify-center gap-4 md:gap-5 px-4 text-center">
          <span
            className="text-5xl md:text-6xl"
            style={{ animation: "rosePulse2 1.2s ease-in-out infinite" }}
          >
            🌹
          </span>
          <p className="text-amber-400 font-extrabold text-lg md:text-xl uppercase tracking-widest">
            Video Complete!
          </p>

          {/* Countdown ring */}
          <div className="relative w-14 h-14 md:w-16 md:h-16">
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
            <span className="absolute inset-0 flex items-center justify-center text-amber-400 font-black text-lg md:text-xl">
              {countdown}
            </span>
          </div>

          <p className="text-white/50 text-xs md:text-sm tracking-widest">{endLabel}</p>

          {/* Manual proceed button */}
          <button
            onClick={advance}
            className="mt-2 px-5 md:px-6 py-2 md:py-2.5 rounded-xl bg-amber-400/20 border border-amber-400/50 text-amber-400 text-xs md:text-sm font-bold tracking-wider hover:bg-amber-400/30 transition-colors"
          >
            Continue Now →
          </button>
        </div>
      )}

      <style>{`
        @keyframes rosePulse2 {
          0%,100% { transform:scale(1);    filter:drop-shadow(0 0 14px rgba(239,68,68,.6)); }
          50%      { transform:scale(1.2);  filter:drop-shadow(0 0 32px rgba(239,68,68,1)); }
        }
      `}</style>
    </div>
  );
}

// -----------------------------------------------------------------------------
// START GAME
// -----------------------------------------------------------------------------
const StartGame: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const params = useSearchParams();
  const name = params.get("name") || "";
  const avatar = params.get("avatar") || "";
  console.log("name from url", name)
  console.log("avatar from url", avatar)
  // const currentUser = useSelector((state: any) => state.user.user);

  const [activeRole, setActiveRole] = useState<Role | null>(null);
  const [isRouting, setIsRouting] = useState(false);
  const [routingRole, setRoutingRole] = useState<Role>("bachelor");
  const { data: getMyProfileData } = useGetMyProfileQuery({});
  const profileData = getMyProfileData?.result;
  // console.log("profile data", profileData)
  const userToken = profileData?.token;
  // console.log("userToken", userToken);

  const token = Cookies.get("accessToken");

  const { sendEvent } = useSocket({
    GAME_STARTED: (payload) => console.log("🎮 Game Started:", payload),
    PLAYERS_UPDATE: (payload) => console.log("👥 Players:", payload),
  });

  // Floating particles
  useEffect(() => {
    const container = document.getElementById("particles");
    if (!container) return;
    for (let i = 0; i < 28; i++) {
      const p = document.createElement("div");
      const size = Math.random() * 4 + 2;
      Object.assign(p.style, {
        position: "absolute",
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: "50%",
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        background: "radial-gradient(circle,#FFE566,#FF8C00)",
        boxShadow: `0 0 ${size * 2}px #FFD700`,
        opacity: String(0.25 + Math.random() * 0.55),
        animation: `floatParticle ${4 + Math.random() * 7}s ease-in-out infinite`,
        animationDelay: `${Math.random() * 5}s`,
      });
      container.appendChild(p);
    }
  }, []);

  const handleBeTheBachelorClick = () => {
    setActiveRole("bachelor")
    if (!userToken) {
      router.push("/buy-tokens")
    }
  }

  const handleVideoFinish = useCallback(() => {
    dispatch(clearPlayers());
    dispatch(resetGameOver());
    if (!activeRole) return;
    const role = activeRole;
    setActiveRole(null);
    setRoutingRole(role);
    setIsRouting(true);

    if (role === "bachelor") {
      sendEvent(
        "CREATE_GAME",
        { gameType: "INTERNET_BACHELOR" },
        (response) => {
          if (response.success) {
            router.push(`host?x-token=${token}`);
          } else {
            setIsRouting(false);
          }
        },
      );
    } else {
      sendEvent(
        "JOIN_GAME",
        {
          gameId: "internet-bachelor-123",
          name: name,
          avatar: avatar,
        },
        (response) => {
          if (response.success) {
            router.push(`/ready-game?x-token=${token}`);
          } else {
            setIsRouting(false);
          }
        },
      );
    }
  }, [dispatch, activeRole, sendEvent, router, name, avatar]);

  return (
    <>
      {isRouting && <RouteLoadingOverlay role={routingRole} />}

      <div className="relative min-h-screen w-full flex items-center justify-center bg-black overflow-hidden font-serif">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#8B1A00,transparent_60%),radial-gradient(ellipse_at_bottom,#0A0000,#000)]" />

        <div className="absolute bottom-0 w-full opacity-60">
          <svg viewBox="0 0 1400 500" className="w-full h-[55vh]">
            <rect width="100%" height="100%" fill="url(#bgGrad)" />
            <defs>
              <linearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#5C1A00" />
                <stop offset="100%" stopColor="#1A0500" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div id="particles" className="absolute inset-0 pointer-events-none" />

        <div className="relative z-10 -top-12 flex flex-col items-center text-center px-6">
          <p className="uppercase tracking-[0.4em] text-yellow-400 text-xs mb-4 italic">
            Season One · Premium Edition
          </p>

          <div className="relative flex flex-col items-center mb-6">
            <img
              src="./bachelor-bg-removebg-preview.png"
              alt="premium edition"
              className="w-xl opacity-90"
            />
            <h2 className="mt-3 text-white font-extrabold text-lg md:text-2xl tracking-widest uppercase">
              Legendary Experience
            </h2>
          </div>

          <h1 className="text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-yellow-400 to-orange-700 text-4xl md:text-6xl font-black tracking-widest">
            INTERNET BACHELOR
          </h1>

          <p className="text-red-300 italic mt-2 text-lg md:text-xl">
            Connect. Find Love.
          </p>

          <div className="flex flex-wrap gap-6 mt-10 justify-center">
            <button
              onClick={() => handleBeTheBachelorClick()}
              className="relative px-8 py-4 font-bold uppercase tracking-widest text-black bg-gradient-to-br from-yellow-200 via-yellow-400 to-orange-600 clip-path-polygon shadow-[0_0_40px_rgba(255,180,0,0.6)] hover:scale-105 transition"
            >
              BE THE BACHELOR
              <span className="block text-xs font-light italic">(1 Token)</span>
            </button>

            <button
              onClick={() => setActiveRole("contestant")}
              className="relative px-8 py-4 font-bold uppercase tracking-widest text-teal-100 border border-teal-400 bg-gradient-to-br from-teal-500 to-teal-900 hover:scale-105 transition shadow-lg"
            >
              BE A CONTESTANT
            </button>
          </div>
        </div>

        <style>{`
          @keyframes floatParticle {
            0%,100% { transform:translateY(0); }
            50%      { transform:translateY(-30px); }
          }
          .clip-path-polygon {
            clip-path: polygon(14px 0%, calc(100% - 14px) 0%, 100% 50%, calc(100% - 14px) 100%, 14px 100%, 0% 50%);
          }
        `}</style>
      </div>

      {activeRole && (
        <VideoModal role={activeRole} onFinish={handleVideoFinish} />
      )}
    </>
  );
};

export default StartGame;
