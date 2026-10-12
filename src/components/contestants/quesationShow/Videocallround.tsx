/* eslint-disable @typescript-eslint/no-explicit-any */
// "use client";

// import { useState, useEffect, useRef } from "react";
// import { Video, PhoneOff } from "lucide-react";
// import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
// import { useSelector } from "react-redux";

// const ZEGO_APP_ID = 1697884864;
// const ZEGO_SERVER_SECRET = "9ad294853be97ac5458a620f1b2c85a1";

// type CallPhase =
//   | "waiting"
//   | "incoming"
//   | "connecting"
//   | "active"
//   | "ended_by_host";

// const GAME_ID = "internet-bachelor-123";

// interface VideoCallRoundProps {
//   sendEvent: (event: string, data: any, cb?: (res: any) => void) => void;
//   incomingHostId: string | null;
//   callKey: number; // increments on every INCOMING_CALL → show incoming screen
//   callEndedKey: number; // increments on every CALL_ENDED   → reset to waiting
//   gameId?: string;
// }

// function ZegoRoom({
//   roomId,
//   userId,
//   userName,
//   onLeave,
// }: {
//   roomId: string;
//   userId: string;
//   userName: string;
//   onLeave: () => void;
// }) {
//   const containerRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     if (!containerRef.current) return;

//     console.log("[PARTICIPANT] Joining ZegoRoom");
//     console.log("  roomId  :", roomId);
//     console.log("  userId  :", userId);
//     console.log("  userName:", userName);

//     const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
//       ZEGO_APP_ID,
//       ZEGO_SERVER_SECRET,
//       roomId,
//       userId,
//       userName,
//     );

//     const zp = ZegoUIKitPrebuilt.create(kitToken);

//     zp.joinRoom({
//       container: containerRef.current,
//       scenario: { mode: ZegoUIKitPrebuilt.OneONoneCall },
//       showPreJoinView: false,
//       showLeavingView: false,
//       turnOnMicrophoneWhenJoining: true,
//       turnOnCameraWhenJoining: true,
//       showMyCameraToggleButton: true,
//       showMyMicrophoneToggleButton: true,
//       showAudioVideoSettingsButton: false,
//       showScreenSharingButton: false,
//       showTextChat: false,
//       showUserList: false,
//       maxUsers: 2,
//       layout: "Auto",
//       onLeaveRoom: onLeave,
//       onUserLeave: onLeave,
//     });

//     return () => {
//       try {
//         zp.destroy();
//       } catch (_) {}
//     };
//   }, []);

//   return (
//     <div
//       ref={containerRef}
//       style={{ width: "100%", height: "100%", minHeight: 400 }}
//     />
//   );
// }

// export default function VideoCallRound({
//   sendEvent,
//   incomingHostId,
//   callKey,
//   callEndedKey,
//   gameId = GAME_ID,
// }: VideoCallRoundProps) {
//   const [callPhase, setCallPhase] = useState<CallPhase>("waiting");
//   const [toast, setToast] = useState<string | null>(null);
//   const toastRef = useRef<NodeJS.Timeout | null>(null);

//   const currentUser = useSelector((state: any) => state.user.user);

//   const roomId = `${currentUser?.id ?? ""}${gameId}`;
//   const userId = currentUser?.id ?? `participant-${Date.now()}`;
//   const userName = currentUser?.name ?? currentUser?.username ?? "Contestant";

//   // -- New incoming call from host -------------------------------------------
//   // callKey changes on every INCOMING_CALL, even same hostId
//   useEffect(() => {
//     if (!incomingHostId) return;
//     setCallPhase("incoming");
//   }, [callKey]);

//   // -- Host ended the call ---------------------------------------------------
//   // callEndedKey changes on every CALL_ENDED event from the server
//   useEffect(() => {
//     if (callEndedKey === 0) return; // ignore initial mount (value = 0)
//     showToast("Host ended the call.");
//     // Brief "ended" screen then back to waiting
//     setCallPhase("ended_by_host");
//     setTimeout(() => setCallPhase("waiting"), 2000);
//   }, [callEndedKey]);

//   const showToast = (msg: string) => {
//     setToast(msg);
//     if (toastRef.current) clearTimeout(toastRef.current);
//     toastRef.current = setTimeout(() => setToast(null), 3000);
//   };

//   const handleJoin = () => {
//     showToast("Connecting to call…");
//     sendEvent(
//       "GAME_EVENT",
//       { gameId, type: "ACCEPT_CALL", payload: {} },
//       (res: any) => console.log("✅ ACCEPT_CALL ACK:", res),
//     );
//     setCallPhase("connecting");
//     setTimeout(() => setCallPhase("active"), 800);
//   };

//   const handleDecline = () => {
//     showToast("Call declined.");
//     sendEvent(
//       "GAME_EVENT",
//       { gameId, type: "REJECT_CALL", payload: {} },
//       (res: any) => console.log("✅ REJECT_CALL ACK:", res),
//     );
//     setTimeout(() => setCallPhase("waiting"), 1000);
//   };

//   const handleLeave = () => {
//     showToast("Call ended. Returning to lobby…");
//     setTimeout(() => setCallPhase("waiting"), 1500);
//   };

//   return (
//     <div className="w-full flex flex-col rounded-2xl overflow-hidden border border-amber-500/20 bg-black/80 backdrop-blur-sm">
//       {/* Status bar */}
//       <div className="flex items-center px-5 py-3 border-b border-white/5 bg-white/[.025] gap-2.5">
//         <span
//           className={`w-2 h-2 rounded-full flex-shrink-0 ${
//             callPhase === "waiting"
//               ? "bg-amber-400 animate-pulse"
//               : callPhase === "incoming"
//                 ? "bg-emerald-400 animate-ping"
//                 : callPhase === "connecting"
//                   ? "bg-yellow-300 animate-pulse"
//                   : callPhase === "ended_by_host"
//                     ? "bg-red-500 animate-pulse"
//                     : "bg-red-500"
//           }`}
//         />
//         <span className="text-[11px] uppercase tracking-[.12em] text-white/40 font-medium">
//           {callPhase === "waiting" && "Video Round · Awaiting call"}
//           {callPhase === "incoming" && "Incoming call · Answer now"}
//           {callPhase === "connecting" && "Connecting · Please wait…"}
//           {callPhase === "active" && "Video call · In progress"}
//           {callPhase === "ended_by_host" && "Call ended by host"}
//         </span>
//       </div>

//       {/* Main area */}
//       <div
//         className="relative flex items-center justify-center overflow-hidden bg-[#080808]"
//         style={{ minHeight: callPhase === "active" ? 420 : 360 }}
//       >
//         <div
//           className="absolute inset-0 pointer-events-none opacity-[.035]"
//           style={{
//             backgroundImage:
//               "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)",
//             backgroundSize: "36px 36px",
//           }}
//         />

//         {/* WAITING */}
//         {callPhase === "waiting" && (
//           <div
//             className="flex flex-col items-center gap-6 z-10 py-10"
//             style={{ animation: "fadeUp .5s ease both" }}
//           >
//             <div className="relative w-24 h-24">
//               {[0, 1].map((i) => (
//                 <span
//                   key={i}
//                   className="absolute inset-0 rounded-full border border-amber-400/25"
//                   style={{
//                     animation: `zping 2.4s ease-out ${i * 0.7}s infinite`,
//                   }}
//                 />
//               ))}
//               <div className="w-24 h-24 rounded-full bg-white/[.035] border border-amber-400/20 flex items-center justify-center">
//                 <Video size={32} className="text-amber-400/60" />
//               </div>
//             </div>
//             <div className="text-center">
//               <p className="text-white/75 font-medium text-base mb-1">
//                 Waiting for your turn
//               </p>
//               <p className="text-white/20 text-xs uppercase tracking-widest">
//                 The host will call you when ready
//               </p>
//             </div>
//             <div className="flex gap-1.5">
//               {[0, 1, 2].map((i) => (
//                 <span
//                   key={i}
//                   className="w-1.5 h-1.5 rounded-full bg-amber-400/50"
//                   style={{
//                     animation: `bounce 1.4s ease-in-out ${i * 0.25}s infinite`,
//                   }}
//                 />
//               ))}
//             </div>
//           </div>
//         )}

//         {/* INCOMING */}
//         {callPhase === "incoming" && (
//           <div
//             className="flex flex-col items-center gap-8 z-10 py-10"
//             style={{ animation: "fadeUp .4s ease both" }}
//           >
//             <div className="relative flex items-center justify-center w-28 h-28">
//               {[0, 1, 2].map((i) => (
//                 <span
//                   key={i}
//                   className="absolute rounded-full border border-emerald-400/20"
//                   style={{
//                     inset: `-${(i + 1) * 14}px`,
//                     animation: `zping 1.8s ease-out ${i * 0.45}s infinite`,
//                   }}
//                 />
//               ))}
//               <div className="w-28 h-28 rounded-full bg-gradient-to-br from-amber-500 to-rose-600 flex items-center justify-center text-4xl font-bold text-white border-2 border-amber-300/40 relative z-10">
//                 H
//               </div>
//             </div>
//             <div className="text-center">
//               <p className="text-[10px] uppercase tracking-[.14em] text-white/25 mb-1.5">
//                 Incoming video call
//               </p>
//               <p className="text-white text-2xl font-semibold mb-0.5">
//                 The Host
//               </p>
//               <p className="text-white/25 text-xs">
//                 Internet Bachelor · Round 2
//               </p>
//             </div>
//             <div className="flex items-end gap-14">
//               <div className="flex flex-col items-center gap-2.5">
//                 <button
//                   onClick={handleDecline}
//                   className="w-14 h-14 rounded-full bg-red-500/90 hover:bg-red-500 active:scale-95 transition-all flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.4)] cursor-pointer"
//                 >
//                   <PhoneOff size={20} className="text-white" />
//                 </button>
//                 <span className="text-[11px] text-white/25">Decline</span>
//               </div>
//               <div className="flex flex-col items-center gap-2.5">
//                 <button
//                   onClick={handleJoin}
//                   className="w-20 h-20 rounded-full bg-emerald-500 hover:bg-emerald-400 active:scale-95 transition-all flex items-center justify-center shadow-[0_0_30px_rgba(52,211,153,0.5)] cursor-pointer"
//                   style={{ animation: "joinPulse 2s ease-in-out infinite" }}
//                 >
//                   <Video size={28} className="text-white" />
//                 </button>
//                 <span className="text-[12px] text-white/45 font-medium">
//                   Join call
//                 </span>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* CONNECTING */}
//         {callPhase === "connecting" && (
//           <div
//             className="flex flex-col items-center gap-5 z-10 py-10"
//             style={{ animation: "fadeUp .3s ease both" }}
//           >
//             <div className="w-12 h-12 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
//             <div className="text-center">
//               <p className="text-white/65 text-sm font-medium mb-1">
//                 Connecting you to the host…
//               </p>
//               <p className="text-white/20 text-xs font-mono tracking-widest">
//                 Setting up video room…
//               </p>
//             </div>
//           </div>
//         )}

//         {/* ACTIVE */}
//         {callPhase === "active" && (
//           <div
//             className="absolute inset-0"
//             style={{ animation: "fadeUp .4s ease both" }}
//           >
//             <ZegoRoom
//               roomId={roomId}
//               userId={userId}
//               userName={userName}
//               onLeave={handleLeave}
//             />
//           </div>
//         )}

//         {/* ENDED BY HOST */}
//         {callPhase === "ended_by_host" && (
//           <div
//             className="flex flex-col items-center gap-5 z-10 py-10"
//             style={{ animation: "fadeUp .3s ease both" }}
//           >
//             <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
//               <PhoneOff size={32} className="text-red-400" />
//             </div>
//             <div className="text-center">
//               <p className="text-red-400 font-semibold text-base mb-1">
//                 Host ended the call
//               </p>
//               <p className="text-white/20 text-xs uppercase tracking-widest">
//                 Returning to lobby…
//               </p>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Toast */}
//       {toast && (
//         <div
//           className="px-5 py-2.5 border-t border-amber-500/10 bg-amber-500/5"
//           style={{ animation: "fadeUp .2s ease both" }}
//         >
//           <p className="text-amber-300/65 text-xs text-center">{toast}</p>
//         </div>
//       )}

//       <style>{`
//         @keyframes fadeUp    { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
//         @keyframes zping     { 0%{transform:scale(1);opacity:.55} 100%{transform:scale(1.9);opacity:0} }
//         @keyframes joinPulse { 0%,100%{box-shadow:0 0 0 0 rgba(52,211,153,.45)} 50%{box-shadow:0 0 0 16px rgba(52,211,153,0)} }
//       `}</style>
//     </div>
//   );
// }

/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Video, PhoneOff, Mic, MicOff, Camera, CameraOff } from "lucide-react";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { useSelector } from "react-redux";

const ZEGO_APP_ID = 1697884864;
const ZEGO_SERVER_SECRET = "9ad294853be97ac5458a620f1b2c85a1";

type CallPhase =
  | "waiting"
  | "incoming"
  | "connecting"
  | "active"
  | "ended_by_host";

const GAME_ID = "internet-bachelor-123";

interface VideoCallRoundProps {
  sendEvent: (event: string, data: any, cb?: (res: any) => void) => void;
  incomingHostId: string | null;
  callKey: number;
  callEndedKey: number;
  gameId?: string;
}

// --- Format seconds → MM:SS ---------------------------------------------------
function fmt(s: number) {
  const m = Math.floor(s / 60)
    .toString()
    .padStart(2, "0");
  const sec = (s % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
}

// --- Circular progress ring ---------------------------------------------------
function RingTimer({
  elapsed,
  total = 60,
}: {
  elapsed: number;
  total?: number;
}) {
  const r = 38;
  const circ = 2 * Math.PI * r;
  const progress = Math.min(elapsed / total, 1);
  const dash = circ * (1 - progress);

  // Color shifts: green → yellow → red
  const hue = Math.max(0, 60 - progress * 60);
  const color = `hsl(${hue}, 80%, 55%)`;

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: 96, height: 96 }}
    >
      <svg
        width="96"
        height="96"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          transform: "rotate(-90deg)",
        }}
      >
        {/* Track */}
        <circle
          cx="48"
          cy="48"
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="4"
        />
        {/* Progress */}
        <circle
          cx="48"
          cy="48"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={dash}
          style={{
            transition: "stroke-dashoffset 0.9s linear, stroke 1s linear",
          }}
        />
      </svg>
      {/* Inner content */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        <span
          className="font-mono font-black tabular-nums leading-none"
          style={{ fontSize: 18, color, letterSpacing: "0.05em" }}
        >
          {fmt(elapsed)}
        </span>
        <span
          className="text-[8px] uppercase tracking-widest mt-0.5"
          style={{ color: "rgba(255,255,255,0.3)" }}
        >
          elapsed
        </span>
      </div>
    </div>
  );
}

// --- Horizontal HUD timer bar (shown during active call) ---------------------
function HUDTimer({
  elapsed,
  total = 60,
}: {
  elapsed: number;
  total?: number;
}) {
  const pct = Math.min((elapsed / total) * 100, 100);
  const remaining = Math.max(total - elapsed, 0);
  const hue = Math.max(0, 60 - (elapsed / total) * 60);
  const color = `hsl(${hue}, 80%, 55%)`;
  const isWarning = remaining <= 30;

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {/* Time row */}
      <div className="flex items-center justify-between px-1">
        {/* Elapsed */}
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span
              className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
              style={{ background: color }}
            />
            <span
              className="relative inline-flex rounded-full h-2 w-2"
              style={{ background: color }}
            />
          </span>
          <span
            className="font-mono font-black tabular-nums text-sm"
            style={{ color, letterSpacing: "0.1em" }}
          >
            {fmt(elapsed)}
          </span>
          <span
            className="text-[9px] uppercase tracking-widest"
            style={{ color: "rgba(255,255,255,0.25)" }}
          >
            elapsed
          </span>
        </div>

        {/* Remaining */}
        <div className="flex items-center gap-1.5">
          <span
            className="text-[9px] uppercase tracking-widest"
            style={{ color: "rgba(255,255,255,0.25)" }}
          >
            left
          </span>
          <span
            className={`font-mono font-black tabular-nums text-sm ${isWarning ? "animate-pulse" : ""}`}
            style={{
              color: isWarning ? "#f87171" : "rgba(255,255,255,0.5)",
              letterSpacing: "0.1em",
            }}
          >
            {fmt(remaining)}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div
        className="w-full rounded-full overflow-hidden"
        style={{ height: 3, background: "rgba(255,255,255,0.07)" }}
      >
        <div
          className="h-full rounded-full"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, hsl(120,80%,45%), ${color})`,
            transition: "width 0.9s linear, background 1s linear",
            boxShadow: `0 0 8px ${color}80`,
          }}
        />
      </div>
    </div>
  );
}

// --- ZegoRoom -----------------------------------------------------------------
function ZegoRoom({
  roomId,
  userId,
  userName,
  onLeave,
  onRemoteJoined,
}: {
  roomId: string;
  userId: string;
  userName: string;
  onLeave: () => void;
  onRemoteJoined: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const remoteJoinedRef = useRef(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
      ZEGO_APP_ID,
      ZEGO_SERVER_SECRET,
      roomId,
      userId,
      userName,
    );

    const zp = ZegoUIKitPrebuilt.create(kitToken);

    zp.joinRoom({
      container: containerRef.current,
      scenario: { mode: ZegoUIKitPrebuilt.OneONoneCall },
      showPreJoinView: false,
      showLeavingView: false,
      turnOnMicrophoneWhenJoining: true,
      turnOnCameraWhenJoining: true,
      showMyCameraToggleButton: true,
      showMyMicrophoneToggleButton: true,
      showAudioVideoSettingsButton: false,
      showScreenSharingButton: false,
      showTextChat: false,
      showUserList: false,
      maxUsers: 2,
      layout: "Auto",

      // ✅ FIX: only end call when remote actually joined then left
      onLeaveRoom: onLeave,
      onUserJoin: (users: any[]) => {
        if (users?.length > 0) {
          remoteJoinedRef.current = true;
          onRemoteJoined();
        }
      },
      onUserLeave: (users: any[]) => {
        if (remoteJoinedRef.current && users?.length > 0) {
          onLeave();
        }
      },
    });

    return () => {
      try {
        zp.destroy();
      } catch (_) {}
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "100%", minHeight: 400 }}
    />
  );
}

// --- Main Component -----------------------------------------------------------
export default function VideoCallRound({
  sendEvent,
  incomingHostId,
  callKey,
  callEndedKey,
  gameId = GAME_ID,
}: VideoCallRoundProps) {
  const [callPhase, setCallPhase] = useState<CallPhase>("waiting");
  const [toast, setToast] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [remoteJoined, setRemoteJoined] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const toastRef = useRef<NodeJS.Timeout | null>(null);

  const CALL_DURATION = 60; // seconds — adjust as needed

  const currentUser = useSelector((state: any) => state.user.user);
  const roomId = `${currentUser?.id ?? ""}${gameId}`;
  const userId = currentUser?.id ?? `participant-${Date.now()}`;
  const userName = currentUser?.name ?? currentUser?.username ?? "Contestant";

  // -- Start / stop timer ----------------------------------------------------
  const startTimer = useCallback(() => {
    setElapsed(0);
    timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Start timer when remote joins
  useEffect(() => {
    if (remoteJoined && callPhase === "active") startTimer();
    return stopTimer;
  }, [remoteJoined, callPhase]);

  // -- New incoming call -----------------------------------------------------
  useEffect(() => {
    if (!incomingHostId) return;
    setCallPhase("incoming");
    setElapsed(0);
    setRemoteJoined(false);
  }, [callKey]);

  // -- Host ended the call ---------------------------------------------------
  useEffect(() => {
    if (callEndedKey === 0) return;
    stopTimer();
    showToast("Host ended the call.");
    setCallPhase("ended_by_host");
    setTimeout(() => setCallPhase("waiting"), 2500);
  }, [callEndedKey]);

  const showToast = (msg: string) => {
    setToast(msg);
    if (toastRef.current) clearTimeout(toastRef.current);
    toastRef.current = setTimeout(() => setToast(null), 3500);
  };

  const handleJoin = () => {
    showToast("Connecting to call…");
    sendEvent(
      "GAME_EVENT",
      { gameId, type: "ACCEPT_CALL", payload: {} },
      (res: any) => console.log("✅ ACCEPT_CALL ACK:", res),
    );
    setCallPhase("connecting");
    setTimeout(() => setCallPhase("active"), 900);
  };

  const handleDecline = () => {
    showToast("Call declined.");
    sendEvent(
      "GAME_EVENT",
      { gameId, type: "REJECT_CALL", payload: {} },
      (res: any) => console.log("✅ REJECT_CALL ACK:", res),
    );
    setTimeout(() => setCallPhase("waiting"), 1000);
  };

  const handleLeave = useCallback(() => {
    stopTimer();
    showToast("Call ended. Returning to lobby…");
    setTimeout(() => setCallPhase("waiting"), 1800);
  }, [stopTimer]);

  const handleRemoteJoined = useCallback(() => {
    setRemoteJoined(true);
  }, []);

  return (
    <div
      className="w-full flex flex-col rounded-2xl overflow-hidden border"
      style={{
        borderColor: "rgba(245,158,11,0.15)",
        background: "linear-gradient(160deg, #090909 0%, #0e0e0e 100%)",
      }}
    >
      {/* -- Status bar ------------------------------------------------------- */}
      <div
        className="flex items-center justify-between px-5 py-3 border-b gap-3"
        style={{
          borderColor: "rgba(255,255,255,0.05)",
          background: "rgba(255,255,255,0.02)",
        }}
      >
        <div className="flex items-center gap-2.5">
          <span
            className={`w-2 h-2 rounded-full flex-shrink-0 ${
              callPhase === "waiting"
                ? "bg-amber-400 animate-pulse"
                : callPhase === "incoming"
                  ? "bg-emerald-400 animate-ping"
                  : callPhase === "connecting"
                    ? "bg-yellow-300 animate-pulse"
                    : callPhase === "active"
                      ? "bg-red-500 animate-pulse"
                      : "bg-red-500"
            }`}
          />
          <span
            className="text-[11px] uppercase tracking-[.12em] font-medium"
            style={{ color: "rgba(255,255,255,0.35)" }}
          >
            {callPhase === "waiting" && "Video Round · Awaiting call"}
            {callPhase === "incoming" && "Incoming call · Answer now"}
            {callPhase === "connecting" && "Connecting · Please wait…"}
            {callPhase === "active" && "Video call · In progress"}
            {callPhase === "ended_by_host" && "Call ended by host"}
          </span>
        </div>

        {/* Live badge during active call */}
        {callPhase === "active" && (
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
            style={{
              background: "rgba(239,68,68,0.12)",
              border: "1px solid rgba(239,68,68,0.25)",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[9px] font-black tracking-widest uppercase text-red-400">
              Live
            </span>
          </div>
        )}
      </div>

      {/* -- Main area -------------------------------------------------------- */}
      <div
        className="relative flex items-center justify-center overflow-hidden"
        style={{
          minHeight: callPhase === "active" ? 460 : 380,
          background: "#080808",
        }}
      >
        {/* Subtle grid texture */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            opacity: 0.025,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* -- WAITING -- */}
        {callPhase === "waiting" && (
          <div
            className="flex flex-col items-center gap-7 z-10 py-12"
            style={{ animation: "vcFadeUp .5s ease both" }}
          >
            <div className="relative w-24 h-24">
              {[0, 1].map((i) => (
                <span
                  key={i}
                  className="absolute inset-0 rounded-full border border-amber-400/20"
                  style={{
                    animation: `vcPing 2.6s ease-out ${i * 0.8}s infinite`,
                  }}
                />
              ))}
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center"
                style={{
                  background: "rgba(245,158,11,0.06)",
                  border: "1px solid rgba(245,158,11,0.18)",
                }}
              >
                <Video size={32} style={{ color: "rgba(245,158,11,0.5)" }} />
              </div>
            </div>
            <div className="text-center space-y-1.5">
              <p className="text-white/70 font-semibold text-base">
                Waiting for your turn
              </p>
              <p
                className="text-[11px] uppercase tracking-widest"
                style={{ color: "rgba(255,255,255,0.2)" }}
              >
                The host will call you when ready
              </p>
            </div>
            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full"
                  style={{
                    background: "rgba(245,158,11,0.45)",
                    animation: `vcBounce 1.4s ease-in-out ${i * 0.28}s infinite`,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* -- INCOMING -- */}
        {callPhase === "incoming" && (
          <div
            className="flex flex-col items-center gap-8 z-10 py-10"
            style={{ animation: "vcFadeUp .4s ease both" }}
          >
            {/* Ambient glow */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse 55% 45% at 50% 35%, rgba(52,211,153,0.08), transparent 70%)",
              }}
            />

            {/* Avatar with rings */}
            <div
              className="relative flex items-center justify-center z-10"
              style={{ width: 120, height: 120 }}
            >
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="absolute rounded-full"
                  style={{
                    inset: `-${(i + 1) * 16}px`,
                    border: "1px solid rgba(52,211,153,0.18)",
                    animation: `vcPing 2s ease-out ${i * 0.5}s infinite`,
                  }}
                />
              ))}
              <div
                className="w-28 h-28 rounded-full flex items-center justify-center text-4xl font-black text-white relative z-10"
                style={{
                  background: "linear-gradient(135deg, #f59e0b, #dc2626)",
                  border: "2px solid rgba(245,158,11,0.4)",
                  boxShadow: "0 0 60px rgba(245,158,11,0.25)",
                }}
              >
                H
              </div>
            </div>

            <div className="text-center z-10 space-y-1.5">
              <p
                className="text-[10px] uppercase tracking-[.18em]"
                style={{ color: "rgba(255,255,255,0.25)" }}
              >
                Incoming video call
              </p>
              <p className="text-white text-2xl font-black tracking-widest uppercase">
                The Host
              </p>
              <p
                className="text-[11px] uppercase tracking-widest"
                style={{ color: "rgba(255,255,255,0.2)" }}
              >
                Internet Bachelor · Round 2
              </p>
            </div>

            {/* Decline / Accept */}
            <div className="flex items-end gap-16 z-10">
              <div className="flex flex-col items-center gap-2.5">
                <button
                  onClick={handleDecline}
                  className="w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-90 cursor-pointer"
                  style={{
                    background: "linear-gradient(135deg, #dc2626, #b91c1c)",
                    boxShadow: "0 0 24px rgba(220,38,38,0.4)",
                  }}
                >
                  <PhoneOff size={20} className="text-white" />
                </button>
                <span
                  className="text-[11px] uppercase tracking-widest"
                  style={{ color: "rgba(255,255,255,0.25)" }}
                >
                  Decline
                </span>
              </div>

              <div className="flex flex-col items-center gap-2.5">
                <button
                  onClick={handleJoin}
                  className="w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-90 cursor-pointer"
                  style={{
                    background: "linear-gradient(135deg, #22c55e, #16a34a)",
                    boxShadow: "0 0 40px rgba(34,197,94,0.45)",
                    animation: "vcJoinPulse 2s ease-in-out infinite",
                  }}
                >
                  <Video size={28} className="text-white" />
                </button>
                <span
                  className="text-[12px] font-semibold"
                  style={{ color: "rgba(255,255,255,0.45)" }}
                >
                  Join call
                </span>
              </div>
            </div>
          </div>
        )}

        {/* -- CONNECTING -- */}
        {callPhase === "connecting" && (
          <div
            className="flex flex-col items-center gap-6 z-10 py-12"
            style={{ animation: "vcFadeUp .3s ease both" }}
          >
            <div
              className="w-14 h-14 rounded-full border-2 border-t-transparent animate-spin"
              style={{
                borderColor: "rgba(34,197,94,0.7)",
                borderTopColor: "transparent",
              }}
            />
            <div className="text-center space-y-1">
              <p className="text-white/60 text-sm font-medium">
                Connecting to host…
              </p>
              <p
                className="font-mono text-xs tracking-widest"
                style={{ color: "rgba(255,255,255,0.18)" }}
              >
                Setting up video room
              </p>
            </div>
          </div>
        )}

        {/* -- ACTIVE -- */}
        {callPhase === "active" && (
          <div
            className="absolute inset-0 flex flex-col"
            style={{ animation: "vcFadeUp .4s ease both" }}
          >
            {/* HUD top overlay */}
            <div
              className="absolute top-0 left-0 right-0 z-20 px-4 pt-3 pb-6 pointer-events-none"
              style={{
                background:
                  "linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)",
              }}
            >
              {/* Timer bar */}
              <HUDTimer elapsed={elapsed} total={CALL_DURATION} />

              {/* Bottom row: name + HD badge */}
              <div className="flex items-center justify-between mt-2 px-1">
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black"
                    style={{
                      background: "linear-gradient(135deg, #f59e0b, #dc2626)",
                    }}
                  >
                    H
                  </div>
                  <span className="text-white text-xs font-black tracking-widest uppercase">
                    The Host
                  </span>
                </div>
                {remoteJoined && (
                  <div
                    className="flex items-center gap-1.5 px-2 py-0.5 rounded-full"
                    style={{
                      background: "rgba(0,0,0,0.5)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    <span
                      className="text-[9px] font-black tracking-widest uppercase"
                      style={{ color: "rgba(255,255,255,0.45)" }}
                    >
                      HD
                    </span>
                    <span className="w-1 h-1 rounded-full bg-green-400 animate-pulse" />
                  </div>
                )}
              </div>
            </div>

            {/* Zego video */}
            <ZegoRoom
              roomId={roomId}
              userId={userId}
              userName={userName}
              onLeave={handleLeave}
              onRemoteJoined={handleRemoteJoined}
            />

            {/* Waiting for host overlay (before remote joins) */}
            {!remoteJoined && (
              <div
                className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 pointer-events-none"
                style={{
                  background: "rgba(0,0,0,0.5)",
                  backdropFilter: "blur(4px)",
                }}
              >
                <RingTimer elapsed={elapsed} total={CALL_DURATION} />
                <p
                  className="text-xs uppercase tracking-widest"
                  style={{ color: "rgba(255,255,255,0.3)" }}
                >
                  Waiting for host to join…
                </p>
              </div>
            )}

            {/* Bottom gradient */}
            <div
              className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none z-10"
              style={{
                background:
                  "linear-gradient(to top, rgba(0,0,0,0.7), transparent)",
              }}
            />
          </div>
        )}

        {/* -- ENDED BY HOST -- */}
        {callPhase === "ended_by_host" && (
          <div
            className="flex flex-col items-center gap-6 z-10 py-12"
            style={{ animation: "vcFadeUp .3s ease both" }}
          >
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.25)",
              }}
            >
              <PhoneOff size={32} style={{ color: "rgba(239,68,68,0.8)" }} />
            </div>
            <div className="text-center space-y-1.5">
              <p className="text-red-400 font-black text-base tracking-widest uppercase">
                Host ended the call
              </p>
              {elapsed > 0 && (
                <p
                  className="font-mono text-sm"
                  style={{ color: "rgba(255,255,255,0.35)" }}
                >
                  Duration: {fmt(elapsed)}
                </p>
              )}
              <p
                className="text-[10px] uppercase tracking-widest"
                style={{ color: "rgba(255,255,255,0.2)" }}
              >
                Returning to lobby…
              </p>
            </div>
          </div>
        )}
      </div>

      {/* -- Toast ------------------------------------------------------------ */}
      {toast && (
        <div
          className="px-5 py-2.5 border-t"
          style={{
            borderColor: "rgba(245,158,11,0.08)",
            background: "rgba(245,158,11,0.04)",
            animation: "vcFadeUp .2s ease both",
          }}
        >
          <p
            className="text-xs text-center"
            style={{ color: "rgba(245,158,11,0.6)" }}
          >
            {toast}
          </p>
        </div>
      )}

      <style>{`
        @keyframes vcFadeUp    { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes vcPing      { 0%{transform:scale(1);opacity:.6} 100%{transform:scale(1.9);opacity:0} }
        @keyframes vcBounce    { 0%,100%{transform:translateY(0);opacity:.4} 50%{transform:translateY(-6px);opacity:1} }
        @keyframes vcJoinPulse { 0%,100%{box-shadow:0 0 0 0 rgba(34,197,94,.45)} 50%{box-shadow:0 0 0 18px rgba(34,197,94,0)} }
      `}</style>
    </div>
  );
}
