// /* eslint-disable @typescript-eslint/no-explicit-any */
// "use client";

// import { useState, useEffect, useRef, useCallback } from "react";
// import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";

// // --- ZegoCloud Credentials ----------------------------------------------------
// const ZEGO_APP_ID = 1697884864;
// const ZEGO_SERVER_SECRET = "9ad294853be97ac5458a620f1b2c85a1";
// const GAME_ID = "internet-bachelor-123";

// const AVATAR_POOL = [
//   "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&h=900&fit=crop&crop=face",
//   "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=900&fit=crop&crop=face",
//   "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&h=900&fit=crop&crop=face",
//   "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&h=900&fit=crop&crop=face",
// ];
// const BG_COLORS = ["#1a6abf", "#2a2a2a", "#6b1a1a", "#1a5c2a"];

// interface Player {
//   id: string;
//   name?: string;
//   socketId: string;
//   isEliminated: boolean;
//   isReady: boolean;
//   isConnected: boolean;
//   hasNetworkIssue: boolean;
//   hasSubmitted: boolean;
//   points: number;
// }

// type CallStatus =
//   | "calling"
//   | "accepted"
//   | "connected"
//   | "rejected"
//   | "cancelled"
//   | "ended";

// // --- Format seconds as MM:SS --------------------------------------------------
// function formatDuration(seconds: number): string {
//   const m = Math.floor(seconds / 60)
//     .toString()
//     .padStart(2, "0");
//   const s = (seconds % 60).toString().padStart(2, "0");
//   return `${m}:${s}`;
// }

// // --- Live Call Timer ----------------------------------------------------------
// function CallTimer({ running }: { running: boolean }) {
//   const [seconds, setSeconds] = useState(0);

//   useEffect(() => {
//     if (!running) return;
//     setSeconds(0);
//     const id = setInterval(() => setSeconds((s) => s + 1), 1000);
//     return () => clearInterval(id);
//   }, [running]);

//   return (
//     <div className="flex items-center gap-2">
//       {/* Pulsing red dot = recording/live indicator */}
//       <span className="relative flex h-2 w-2">
//         <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
//         <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
//       </span>
//       <span
//         className="font-mono text-sm font-bold tracking-[0.2em] text-white tabular-nums"
//         style={{ fontVariantNumeric: "tabular-nums" }}
//       >
//         {formatDuration(seconds)}
//       </span>
//     </div>
//   );
// }

// // --- ZegoRoom -----------------------------------------------------------------
// // KEY FIX: onUserLeave should only trigger end when a user who actually JOINED leaves.
// // We track whether a remote user joined at all before treating leave as "call ended".
// function ZegoRoom({
//   roomId,
//   userId,
//   userName,
//   onLeave,
//   onRemoteUserJoined,
// }: {
//   roomId: string;
//   userId: string;
//   userName: string;
//   onLeave: () => void;
//   onRemoteUserJoined: () => void;
// }) {
//   const containerRef = useRef<HTMLDivElement>(null);
//   const remoteJoinedRef = useRef(false);
//   const zpRef = useRef<any>(null);

//   useEffect(() => {
//     if (!containerRef.current) return;

//     const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
//       ZEGO_APP_ID,
//       ZEGO_SERVER_SECRET,
//       roomId,
//       userId,
//       userName,
//     );

//     const zp = ZegoUIKitPrebuilt.create(kitToken);
//     zpRef.current = zp;

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

//       // ✅ FIX 1: onLeaveRoom = host pressed the leave button themselves
//       onLeaveRoom: () => {
//         onLeave();
//       },

//       // ✅ FIX 2: onUserJoin fires when remote user joins — mark them as joined
//       onUserJoin: (users: any[]) => {
//         if (users && users.length > 0) {
//           remoteJoinedRef.current = true;
//           onRemoteUserJoined();
//         }
//       },

//       // ✅ FIX 3: onUserLeave only ends the call if the remote user actually joined first.
//       // This prevents the "ghost leave" that fired immediately and disabled the button.
//       onUserLeave: (users: any[]) => {
//         if (remoteJoinedRef.current && users && users.length > 0) {
//           onLeave();
//         }
//         // If remote never joined, do nothing — host is still waiting
//       },
//     });

//     return () => {
//       try {
//         zpRef.current?.destroy();
//       } catch (_) {}
//     };
//   }, []);

//   return (
//     <div
//       ref={containerRef}
//       className="w-full h-full"
//       style={{ minHeight: 480 }}
//     />
//   );
// }

// // --- Video Call Modal ---------------------------------------------------------
// export function VideoCallModal({
//   player,
//   index,
//   onClose,
//   sendEvent,
//   callAccepted,
//   callRejected,
//   hostUserId,
//   hostUserName,
// }: {
//   player: Player;
//   index: number;
//   onClose: () => void;
//   sendEvent: (event: string, payload: unknown) => void;
//   callAccepted: boolean;
//   callRejected: boolean;
//   hostUserId: string;
//   hostUserName: string;
// }) {
//   const [status, setStatus] = useState<CallStatus>("calling");
//   const [remoteJoined, setRemoteJoined] = useState(false);
//   const statusRef = useRef<CallStatus>("calling");

//   const set = (s: CallStatus) => {
//     statusRef.current = s;
//     setStatus(s);
//   };

//   const callRoomId = `${player.id}${GAME_ID}`;
//   const displayName = player.name ?? `Player ${index + 1}`;
//   const avatar = AVATAR_POOL[index % AVATAR_POOL.length];
//   const bgColor = BG_COLORS[index % BG_COLORS.length];

//   // Notify player of incoming call
//   useEffect(() => {
//     sendEvent("GAME_EVENT", {
//       gameId: GAME_ID,
//       type: "CALL_PLAYER",
//       payload: { userId: player.id },
//     });
//   }, []);

//   // Player accepted
//   useEffect(() => {
//     if (!callAccepted) return;
//     if (statusRef.current !== "calling" && statusRef.current !== "accepted")
//       return;
//     set("accepted");
//     // Short transition then show Zego
//     const t = setTimeout(() => {
//       if (statusRef.current === "accepted") set("connected");
//     }, 1800);
//     return () => clearTimeout(t);
//   }, [callAccepted]);

//   // Player rejected
//   useEffect(() => {
//     if (!callRejected) return;
//     if (statusRef.current !== "calling") return;
//     sendEvent("GAME_EVENT", {
//       gameId: GAME_ID,
//       type: "END_CALL",
//       payload: { userId: player.id, reason: "rejected" },
//     });
//     set("rejected");
//     const t = setTimeout(onClose, 2800);
//     return () => clearTimeout(t);
//   }, [callRejected]);

//   const handleCancel = () => {
//     if (statusRef.current !== "calling") return;
//     sendEvent("GAME_EVENT", {
//       gameId: GAME_ID,
//       type: "END_CALL",
//       payload: { userId: player.id, reason: "cancelled" },
//     });
//     set("cancelled");
//     setTimeout(onClose, 1400);
//   };

//   const handleZegoLeave = useCallback(() => {
//     sendEvent("GAME_EVENT", {
//       gameId: GAME_ID,
//       type: "END_CALL",
//       payload: { userId: player.id, reason: "completed" },
//     });
//     set("ended");
//     setTimeout(onClose, 1200);
//   }, [player.id]);

//   const handleRemoteJoined = useCallback(() => {
//     setRemoteJoined(true);
//   }, []);

//   return (
//     <>
//       {/* Backdrop */}
//       <div
//         className="fixed inset-0 z-50 flex items-center justify-center p-4"
//         style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(18px)" }}
//       >
//         {/* Modal shell */}
//         <div
//           className="relative w-full overflow-hidden flex flex-col"
//           style={{
//             maxWidth: 760,
//             minHeight: 560,
//             borderRadius: 28,
//             background:
//               "linear-gradient(160deg, #0f0f0f 0%, #161616 60%, #0a0a0a 100%)",
//             border: "1px solid rgba(255,255,255,0.07)",
//             boxShadow:
//               "0 40px 120px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.04) inset",
//           }}
//         >
//           {/* -- CALLING STATE -- */}
//           {status === "calling" && (
//             <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 z-10">
//               {/* Ambient glow */}
//               <div
//                 className="absolute inset-0 pointer-events-none"
//                 style={{
//                   background: `radial-gradient(ellipse 60% 50% at 50% 35%, ${bgColor}55, transparent 70%)`,
//                 }}
//               />

//               {/* Ripple rings */}
//               <div className="relative flex items-center justify-center z-10">
//                 {[170, 220, 270].map((size, i) => (
//                   <span
//                     key={size}
//                     className="absolute rounded-full"
//                     style={{
//                       width: size,
//                       height: size,
//                       border: `1px solid ${bgColor}40`,
//                       animation: `vcRipple ${1.6 + i * 0.5}s ease-out infinite`,
//                       animationDelay: `${i * 0.25}s`,
//                     }}
//                   />
//                 ))}
//                 {/* Avatar */}
//                 <div className="relative z-10">
//                   <img
//                     src={avatar}
//                     alt={displayName}
//                     className="w-32 h-32 rounded-full object-cover object-top"
//                     style={{
//                       border: `3px solid ${bgColor}80`,
//                       boxShadow: `0 0 60px ${bgColor}60`,
//                     }}
//                   />
//                   {/* Signal bars overlay */}
//                   <div
//                     className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full flex items-center justify-center"
//                     style={{ background: bgColor, border: "2px solid #0f0f0f" }}
//                   >
//                     <span className="text-base">📞</span>
//                   </div>
//                 </div>
//               </div>

//               {/* Text */}
//               <div className="z-10 text-center space-y-2">
//                 <p
//                   className="text-[10px] tracking-[0.55em] uppercase font-mono"
//                   style={{ color: "rgba(255,255,255,0.35)" }}
//                 >
//                   Ringing…
//                 </p>
//                 <p className="text-white text-2xl font-black tracking-widest uppercase">
//                   {displayName}
//                 </p>
//                 <p
//                   className="font-mono text-[10px] break-all max-w-[240px] mx-auto"
//                   style={{ color: "rgba(255,255,255,0.2)" }}
//                 >
//                   {player.id}
//                 </p>
//                 {/* Animated dots */}
//                 <div className="flex items-center justify-center gap-1.5 pt-1">
//                   {[0, 200, 400].map((d) => (
//                     <span
//                       key={d}
//                       className="w-1.5 h-1.5 rounded-full"
//                       style={{
//                         background: "rgba(255,255,255,0.3)",
//                         animation: `vcBounce 1.2s ease-in-out infinite`,
//                         animationDelay: `${d}ms`,
//                       }}
//                     />
//                   ))}
//                 </div>
//               </div>

//               {/* Cancel button */}
//               <button
//                 onClick={handleCancel}
//                 className="z-10 flex flex-col items-center gap-2 group"
//               >
//                 <div
//                   className="w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-all duration-200 group-hover:scale-110 group-active:scale-90"
//                   style={{
//                     background: "linear-gradient(135deg, #dc2626, #b91c1c)",
//                     boxShadow: "0 0 40px rgba(220,38,38,0.5)",
//                   }}
//                 >
//                   📵
//                 </div>
//                 <span
//                   className="text-[10px] tracking-[0.4em] uppercase font-mono"
//                   style={{ color: "rgba(255,255,255,0.25)" }}
//                 >
//                   Cancel
//                 </span>
//               </button>
//             </div>
//           )}

//           {/* -- ACCEPTED / CONNECTING STATE -- */}
//           {status === "accepted" && (
//             <div
//               className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-6"
//               style={{
//                 background: "rgba(0,0,0,0.6)",
//                 backdropFilter: "blur(8px)",
//               }}
//             >
//               <div className="relative flex items-center justify-center">
//                 {[150, 200].map((size, i) => (
//                   <span
//                     key={size}
//                     className="absolute rounded-full"
//                     style={{
//                       width: size,
//                       height: size,
//                       border: "1.5px solid rgba(74,222,128,0.35)",
//                       animation: `vcRipple ${1.1 + i * 0.4}s ease-out infinite`,
//                     }}
//                   />
//                 ))}
//                 <img
//                   src={avatar}
//                   alt={displayName}
//                   className="w-28 h-28 rounded-full object-cover object-top relative z-10"
//                   style={{
//                     border: "3px solid rgba(74,222,128,0.6)",
//                     boxShadow: "0 0 50px rgba(74,222,128,0.4)",
//                   }}
//                 />
//                 <div
//                   className="absolute -bottom-1 -right-1 z-20 w-9 h-9 rounded-full flex items-center justify-center font-black text-sm"
//                   style={{ background: "#22c55e", border: "2px solid #0f0f0f" }}
//                 >
//                   ✓
//                 </div>
//               </div>
//               <div className="text-center space-y-1">
//                 <p className="text-green-400 font-black text-xs tracking-[0.5em] uppercase animate-pulse">
//                   Call Accepted
//                 </p>
//                 <p className="text-white font-black text-xl tracking-widest uppercase">
//                   {displayName}
//                 </p>
//                 <p
//                   className="font-mono text-xs"
//                   style={{ color: "rgba(255,255,255,0.3)" }}
//                 >
//                   Connecting video stream…
//                 </p>
//               </div>
//               {/* Progress bar */}
//               <div
//                 className="w-52 h-0.5 rounded-full overflow-hidden"
//                 style={{ background: "rgba(255,255,255,0.08)" }}
//               >
//                 <div
//                   className="h-full rounded-full"
//                   style={{
//                     background: "linear-gradient(90deg, #22c55e, #86efac)",
//                     animation: "vcProgress 1.8s ease-out forwards",
//                   }}
//                 />
//               </div>
//             </div>
//           )}

//           {/* -- CONNECTED STATE (Zego + HUD) -- */}
//           {status === "connected" && (
//             <div
//               className="relative w-full flex flex-col"
//               style={{ minHeight: 560 }}
//             >
//               {/* HUD top bar */}
//               <div
//                 className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-5 py-3"
//                 style={{
//                   background:
//                     "linear-gradient(to bottom, rgba(0,0,0,0.75), transparent)",
//                   pointerEvents: "none",
//                 }}
//               >
//                 {/* Left: caller info */}
//                 <div className="flex items-center gap-3">
//                   <img
//                     src={avatar}
//                     alt={displayName}
//                     className="w-9 h-9 rounded-full object-cover object-top"
//                     style={{ border: "1.5px solid rgba(255,255,255,0.2)" }}
//                   />
//                   <div>
//                     <p className="text-white text-xs font-black tracking-widest uppercase leading-none">
//                       {displayName}
//                     </p>
//                     <p
//                       className="font-mono text-[9px] mt-0.5"
//                       style={{ color: "rgba(255,255,255,0.3)" }}
//                     >
//                       {player.id.slice(0, 16)}…
//                     </p>
//                   </div>
//                 </div>

//                 {/* Right: live timer */}
//                 <div
//                   className="flex items-center gap-2 px-3 py-1.5 rounded-full"
//                   style={{
//                     background: "rgba(0,0,0,0.55)",
//                     border: "1px solid rgba(255,255,255,0.1)",
//                     pointerEvents: "none",
//                   }}
//                 >
//                   <CallTimer running={remoteJoined} />
//                   {!remoteJoined && (
//                     <span
//                       className="font-mono text-xs"
//                       style={{ color: "rgba(255,255,255,0.35)" }}
//                     >
//                       Waiting…
//                     </span>
//                   )}
//                 </div>
//               </div>

//               {/* Quality badge */}
//               {remoteJoined && (
//                 <div
//                   className="absolute top-14 right-4 z-20 flex items-center gap-1.5 px-2 py-1 rounded-full"
//                   style={{
//                     background: "rgba(0,0,0,0.5)",
//                     border: "1px solid rgba(255,255,255,0.08)",
//                   }}
//                 >
//                   <span className="text-green-400 text-[9px] font-black tracking-widest uppercase">
//                     HD LIVE
//                   </span>
//                   <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
//                 </div>
//               )}

//               {/* Zego container */}
//               <ZegoRoom
//                 roomId={callRoomId}
//                 userId={hostUserId}
//                 userName={hostUserName}
//                 onLeave={handleZegoLeave}
//                 onRemoteUserJoined={handleRemoteJoined}
//               />

//               {/* Bottom gradient fade */}
//               <div
//                 className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none z-10"
//                 style={{
//                   background:
//                     "linear-gradient(to top, rgba(0,0,0,0.6), transparent)",
//                 }}
//               />
//             </div>
//           )}

//           {/* -- CANCELLED STATE -- */}
//           {status === "cancelled" && (
//             <div
//               className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-5"
//               style={{ background: "rgba(0,0,0,0.97)" }}
//             >
//               <div
//                 className="w-20 h-20 rounded-full flex items-center justify-center text-4xl"
//                 style={{
//                   background: "rgba(239,68,68,0.12)",
//                   border: "1px solid rgba(239,68,68,0.3)",
//                 }}
//               >
//                 🚫
//               </div>
//               <div className="text-center space-y-1.5">
//                 <p className="text-white font-black text-xl tracking-widest uppercase">
//                   Call Cancelled
//                 </p>
//                 <p
//                   className="font-mono text-xs"
//                   style={{ color: "rgba(255,255,255,0.3)" }}
//                 >
//                   You ended the call before they answered
//                 </p>
//               </div>
//             </div>
//           )}

//           {/* -- REJECTED STATE -- */}
//           {status === "rejected" && (
//             <div
//               className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-6"
//               style={{
//                 background: "rgba(0,0,0,0.93)",
//                 backdropFilter: "blur(8px)",
//               }}
//             >
//               <div className="relative flex items-center justify-center">
//                 {[150, 200].map((size, i) => (
//                   <span
//                     key={size}
//                     className="absolute rounded-full"
//                     style={{
//                       width: size,
//                       height: size,
//                       border: "1px solid rgba(239,68,68,0.2)",
//                       animation: `vcRipple ${1.3 + i * 0.5}s ease-out infinite`,
//                     }}
//                   />
//                 ))}
//                 <img
//                   src={avatar}
//                   alt={displayName}
//                   className="w-28 h-28 rounded-full object-cover object-top relative z-10 grayscale opacity-40"
//                   style={{ border: "3px solid rgba(239,68,68,0.4)" }}
//                 />
//                 <div
//                   className="absolute -bottom-1 -right-1 z-20 w-8 h-8 rounded-full flex items-center justify-center font-black text-sm"
//                   style={{ background: "#dc2626", border: "2px solid #0f0f0f" }}
//                 >
//                   ✕
//                 </div>
//               </div>
//               <div className="text-center space-y-2">
//                 <p className="text-red-400 font-black text-xs tracking-[0.5em] uppercase animate-pulse">
//                   Call Declined
//                 </p>
//                 <p className="text-white font-black text-xl tracking-widest uppercase">
//                   {displayName}
//                 </p>
//                 <p
//                   className="font-mono text-sm"
//                   style={{ color: "rgba(255,255,255,0.3)" }}
//                 >
//                   is not available right now
//                 </p>
//               </div>
//               <div className="flex items-center gap-2">
//                 {[0, 200, 400].map((d) => (
//                   <span
//                     key={d}
//                     className="w-1.5 h-1.5 rounded-full"
//                     style={{
//                       background: "rgba(255,255,255,0.2)",
//                       animation: `vcBounce 1.2s ease-in-out infinite`,
//                       animationDelay: `${d}ms`,
//                     }}
//                   />
//                 ))}
//                 <span
//                   className="font-mono text-[10px] ml-1 tracking-widest"
//                   style={{ color: "rgba(255,255,255,0.2)" }}
//                 >
//                   closing…
//                 </span>
//               </div>
//             </div>
//           )}

//           {/* -- ENDED STATE -- */}
//           {status === "ended" && (
//             <div
//               className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-5"
//               style={{ background: "rgba(0,0,0,0.97)" }}
//             >
//               <div
//                 className="w-20 h-20 rounded-full flex items-center justify-center text-4xl"
//                 style={{
//                   background: "rgba(255,255,255,0.05)",
//                   border: "1px solid rgba(255,255,255,0.1)",
//                 }}
//               >
//                 📵
//               </div>
//               <div className="text-center space-y-1.5">
//                 <p className="text-white font-black text-xl tracking-widest uppercase">
//                   Call Ended
//                 </p>
//                 <p
//                   className="font-mono text-xs"
//                   style={{ color: "rgba(255,255,255,0.3)" }}
//                 >
//                   Connection closed
//                 </p>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Global keyframes — injected once */}
//       <style>{`
//         @keyframes vcRipple {
//           0%   { transform: scale(0.85); opacity: 0.7; }
//           100% { transform: scale(1.25); opacity: 0; }
//         }
//         @keyframes vcBounce {
//           0%, 100% { transform: translateY(0); opacity: 0.4; }
//           50%       { transform: translateY(-5px); opacity: 1; }
//         }
//         @keyframes vcProgress {
//           from { width: 0%; }
//           to   { width: 100%; }
//         }
//       `}</style>
//     </>
//   );
// }

/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";

// --- ZegoCloud Credentials ----------------------------------------------------
const ZEGO_APP_ID = 1697884864;
const ZEGO_SERVER_SECRET = "9ad294853be97ac5458a620f1b2c85a1";
const GAME_ID = "internet-bachelor-123";

// --- Hard call time limit (milliseconds) -------------------------------------
// Change this to adjust the limit. Currently 60 seconds.
const CALL_TIME_LIMIT_MS = 60_000;
const CALL_TIME_LIMIT_SECONDS = CALL_TIME_LIMIT_MS / 1000; // 60

const AVATAR_POOL = [
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&h=900&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=900&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&h=900&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&h=900&fit=crop&crop=face",
];
const BG_COLORS = ["#1a6abf", "#2a2a2a", "#6b1a1a", "#1a5c2a"];

interface Player {
  id: string;
  name?: string;
  socketId: string;
  isEliminated: boolean;
  isReady: boolean;
  isConnected: boolean;
  hasNetworkIssue: boolean;
  hasSubmitted: boolean;
  points: number;
}

type CallStatus =
  | "calling"
  | "accepted"
  | "connected"
  | "rejected"
  | "cancelled"
  | "ended"
  | "timeout"; // ← NEW: timed out at 60 s

// --- Format seconds as MM:SS --------------------------------------------------
function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

// --- Live Call Timer ----------------------------------------------------------
// FIX: Added `onExpire` callback — fires exactly at `limitSeconds`.
// The countdown bar turns red as you approach the limit.
function CallTimer({
  running,
  limitSeconds,
  onExpire,
}: {
  running: boolean;
  limitSeconds: number;
  onExpire: () => void;
}) {
  const [seconds, setSeconds] = useState(0);
  const expiredRef = useRef(false);

  useEffect(() => {
    if (!running) return;
    // Reset every time the timer starts
    setSeconds(0);
    expiredRef.current = false;

    const id = setInterval(() => {
      setSeconds((s) => {
        const next = s + 1;
        // Fire onExpire exactly once when we hit the limit
        if (next >= limitSeconds && !expiredRef.current) {
          expiredRef.current = true;
          // Use setTimeout(0) so we don't call setState inside setState
          setTimeout(onExpire, 0);
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [running]); // only restarts when running changes

  const remaining = Math.max(0, limitSeconds - seconds);
  const progress = Math.min(seconds / limitSeconds, 1); // 0 → 1
  const isWarning = remaining <= 15; // last 15 seconds turn red

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-2">
        {/* Pulsing dot */}
        <span className="relative flex h-2 w-2">
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              isWarning ? "bg-red-400" : "bg-red-400"
            }`}
          />
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${
              isWarning ? "bg-red-500" : "bg-red-500"
            }`}
          />
        </span>
        {/* Elapsed time */}
        <span
          className={`font-mono text-sm font-bold tracking-[0.2em] tabular-nums ${
            isWarning ? "text-red-400" : "text-white"
          }`}
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {formatDuration(seconds)}
        </span>
      </div>

      {/* Progress bar — drains to zero */}
      <div
        className="w-24 h-0.5 rounded-full overflow-hidden"
        style={{ background: "rgba(255,255,255,0.1)" }}
      >
        <div
          className={`h-full rounded-full transition-all duration-1000 ${
            isWarning
              ? "bg-gradient-to-r from-red-600 to-red-400"
              : "bg-gradient-to-r from-green-600 to-green-400"
          }`}
          style={{ width: `${(1 - progress) * 100}%` }}
        />
      </div>

      {/* Countdown label */}
      <span
        className={`font-mono text-[9px] tracking-[0.3em] uppercase ${
          isWarning ? "text-red-400 animate-pulse" : "text-white/30"
        }`}
      >
        {remaining}s left
      </span>
    </div>
  );
}

// --- ZegoRoom -----------------------------------------------------------------
// FIX: Exposed `zpRef` via a callback ref so VideoCallModal can call
// `zp.destroy()` + `onLeave()` from outside (the 60-second timeout).
function ZegoRoom({
  roomId,
  userId,
  userName,
  onLeave,
  onRemoteUserJoined,
  zegoRefCallback, // ← NEW: parent stores the zp instance
}: {
  roomId: string;
  userId: string;
  userName: string;
  onLeave: () => void;
  onRemoteUserJoined: () => void;
  zegoRefCallback: (zp: any) => void; // ← NEW
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const remoteJoinedRef = useRef(false);
  const zpRef = useRef<any>(null);

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
    zpRef.current = zp;
    zegoRefCallback(zp); // ← give the ref to VideoCallModal immediately

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

      // Host pressed leave button themselves
      onLeaveRoom: () => {
        onLeave();
      },

      // Remote user joined — mark them
      onUserJoin: (users: any[]) => {
        if (users && users.length > 0) {
          remoteJoinedRef.current = true;
          onRemoteUserJoined();
        }
      },

      // Remote user left — only end if they actually joined first
      onUserLeave: (users: any[]) => {
        if (remoteJoinedRef.current && users && users.length > 0) {
          onLeave();
        }
      },
    });

    return () => {
      try {
        zpRef.current?.destroy();
      } catch (_) {}
      zegoRefCallback(null); // clear the ref on unmount
    };
  }, []); // intentionally run once

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      style={{ minHeight: 480 }}
    />
  );
}

// --- Video Call Modal ---------------------------------------------------------
export function VideoCallModal({
  player,
  index,
  onClose,
  sendEvent,
  callAccepted,
  callRejected,
  hostUserId,
  hostUserName,
}: {
  player: Player;
  index: number;
  onClose: () => void;
  sendEvent: (event: string, payload: unknown) => void;
  callAccepted: boolean;
  callRejected: boolean;
  hostUserId: string;
  hostUserName: string;
}) {
  const [status, setStatus] = useState<CallStatus>("calling");
  const [remoteJoined, setRemoteJoined] = useState(false);
  const statusRef = useRef<CallStatus>("calling");

  // -- NEW: store Zego instance so we can destroy it on timeout -------------
  const zegoInstanceRef = useRef<any>(null);

  // -- NEW: store the 60-second hard-limit timer so we can clear it ---------
  const hardLimitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const set = (s: CallStatus) => {
    statusRef.current = s;
    setStatus(s);
  };

  const callRoomId = `${player.id}${GAME_ID}`;
  const displayName = player.name ?? `Player ${index + 1}`;
  const avatar = AVATAR_POOL[index % AVATAR_POOL.length];
  const bgColor = BG_COLORS[index % BG_COLORS.length];

  // -- Clean up the hard-limit timer on unmount ------------------------------
  useEffect(() => {
    return () => {
      if (hardLimitTimerRef.current) {
        clearTimeout(hardLimitTimerRef.current);
      }
    };
  }, []);

  // Notify player of incoming call
  useEffect(() => {
    sendEvent("GAME_EVENT", {
      gameId: GAME_ID,
      type: "CALL_PLAYER",
      payload: { userId: player.id },
    });
  }, []);

  // Player accepted
  useEffect(() => {
    if (!callAccepted) return;
    if (statusRef.current !== "calling" && statusRef.current !== "accepted")
      return;
    set("accepted");
    const t = setTimeout(() => {
      if (statusRef.current === "accepted") set("connected");
    }, 1800);
    return () => clearTimeout(t);
  }, [callAccepted]);

  // Player rejected
  useEffect(() => {
    if (!callRejected) return;
    if (statusRef.current !== "calling") return;
    sendEvent("GAME_EVENT", {
      gameId: GAME_ID,
      type: "END_CALL",
      payload: { userId: player.id, reason: "rejected" },
    });
    set("rejected");
    const t = setTimeout(onClose, 2800);
    return () => clearTimeout(t);
  }, [callRejected]);

  // -- NEW: Start hard 60-second limit the moment status becomes "connected" --
  // This is the PRIMARY fix. As soon as Zego is live, we set a 60-second
  // timeout. If it fires, we destroy Zego and close the modal — regardless
  // of what the user/player is doing.
  useEffect(() => {
    if (status !== "connected") return;

    console.log("⏱ 60-second call limit started");

    hardLimitTimerRef.current = setTimeout(() => {
      // Only act if we're still in a connected state (not already ended)
      if (
        statusRef.current === "connected" ||
        statusRef.current === "accepted"
      ) {
        console.log("⏰ 60-second limit reached — force-ending call");

        // 1. Notify the player the call is over
        sendEvent("GAME_EVENT", {
          gameId: GAME_ID,
          type: "END_CALL",
          payload: { userId: player.id, reason: "timeout" },
        });

        // 2. Force-destroy the Zego room (stops video/audio immediately)
        try {
          zegoInstanceRef.current?.destroy();
        } catch (_) {}

        // 3. Update UI to show "timeout" state, then close
        set("timeout");
        setTimeout(onClose, 2000);
      }
    }, CALL_TIME_LIMIT_MS);

    // If the component unmounts or status changes away from "connected",
    // clear the timer so it doesn't fire after the modal is gone.
    return () => {
      if (hardLimitTimerRef.current) {
        clearTimeout(hardLimitTimerRef.current);
        hardLimitTimerRef.current = null;
      }
    };
  }, [status]); // re-runs when status changes; only activates for "connected"

  const handleCancel = () => {
    if (statusRef.current !== "calling") return;
    sendEvent("GAME_EVENT", {
      gameId: GAME_ID,
      type: "END_CALL",
      payload: { userId: player.id, reason: "cancelled" },
    });
    set("cancelled");
    setTimeout(onClose, 1400);
  };

  // -- handleZegoLeave: called when Zego itself ends (user pressed leave) ----
  const handleZegoLeave = useCallback(() => {
    // Clear the 60s timer since the call ended naturally
    if (hardLimitTimerRef.current) {
      clearTimeout(hardLimitTimerRef.current);
      hardLimitTimerRef.current = null;
    }
    sendEvent("GAME_EVENT", {
      gameId: GAME_ID,
      type: "END_CALL",
      payload: { userId: player.id, reason: "completed" },
    });
    set("ended");
    setTimeout(onClose, 1200);
  }, [player.id]);

  // -- handleTimerExpire: called by CallTimer UI at 60s (visual backup) ------
  // The primary enforcer is the useEffect setTimeout above.
  // This is a secondary backup fired by the CallTimer component's onExpire.
  const handleTimerExpire = useCallback(() => {
    if (statusRef.current !== "connected" && statusRef.current !== "accepted")
      return;

    console.log("⏰ CallTimer onExpire fired — force-ending call");

    sendEvent("GAME_EVENT", {
      gameId: GAME_ID,
      type: "END_CALL",
      payload: { userId: player.id, reason: "timeout" },
    });

    try {
      zegoInstanceRef.current?.destroy();
    } catch (_) {}

    set("timeout");
    setTimeout(onClose, 2000);
  }, [player.id]);

  const handleRemoteJoined = useCallback(() => {
    setRemoteJoined(true);
  }, []);

  // -- Store Zego instance ref from ZegoRoom ---------------------------------
  const handleZegoRef = useCallback((zp: any) => {
    zegoInstanceRef.current = zp;
  }, []);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(18px)" }}
      >
        {/* Modal shell */}
        <div
          className="relative w-full overflow-hidden flex flex-col"
          style={{
            maxWidth: 760,
            minHeight: 560,
            borderRadius: 28,
            background:
              "linear-gradient(160deg, #0f0f0f 0%, #161616 60%, #0a0a0a 100%)",
            border: "1px solid rgba(255,255,255,0.07)",
            boxShadow:
              "0 40px 120px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.04) inset",
          }}
        >
          {/* -- CALLING STATE -- */}
          {status === "calling" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 z-10">
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `radial-gradient(ellipse 60% 50% at 50% 35%, ${bgColor}55, transparent 70%)`,
                }}
              />
              <div className="relative flex items-center justify-center z-10">
                {[170, 220, 270].map((size, i) => (
                  <span
                    key={size}
                    className="absolute rounded-full"
                    style={{
                      width: size,
                      height: size,
                      border: `1px solid ${bgColor}40`,
                      animation: `vcRipple ${1.6 + i * 0.5}s ease-out infinite`,
                      animationDelay: `${i * 0.25}s`,
                    }}
                  />
                ))}
                <div className="relative z-10">
                  <img
                    src={avatar}
                    alt={displayName}
                    className="w-32 h-32 rounded-full object-cover object-top"
                    style={{
                      border: `3px solid ${bgColor}80`,
                      boxShadow: `0 0 60px ${bgColor}60`,
                    }}
                  />
                  <div
                    className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full flex items-center justify-center"
                    style={{ background: bgColor, border: "2px solid #0f0f0f" }}
                  >
                    <span className="text-base">📞</span>
                  </div>
                </div>
              </div>
              <div className="z-10 text-center space-y-2">
                <p
                  className="text-[10px] tracking-[0.55em] uppercase font-mono"
                  style={{ color: "rgba(255,255,255,0.35)" }}
                >
                  Ringing…
                </p>
                <p className="text-white text-2xl font-black tracking-widest uppercase">
                  {displayName}
                </p>
                <p
                  className="font-mono text-[10px] break-all max-w-[240px] mx-auto"
                  style={{ color: "rgba(255,255,255,0.2)" }}
                >
                  {player.id}
                </p>
                <div className="flex items-center justify-center gap-1.5 pt-1">
                  {[0, 200, 400].map((d) => (
                    <span
                      key={d}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{
                        background: "rgba(255,255,255,0.3)",
                        animation: `vcBounce 1.2s ease-in-out infinite`,
                        animationDelay: `${d}ms`,
                      }}
                    />
                  ))}
                </div>
              </div>
              <button
                onClick={handleCancel}
                className="z-10 flex flex-col items-center gap-2 group"
              >
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-all duration-200 group-hover:scale-110 group-active:scale-90"
                  style={{
                    background: "linear-gradient(135deg, #dc2626, #b91c1c)",
                    boxShadow: "0 0 40px rgba(220,38,38,0.5)",
                  }}
                >
                  📵
                </div>
                <span
                  className="text-[10px] tracking-[0.4em] uppercase font-mono"
                  style={{ color: "rgba(255,255,255,0.25)" }}
                >
                  Cancel
                </span>
              </button>
            </div>
          )}

          {/* -- ACCEPTED / CONNECTING STATE -- */}
          {status === "accepted" && (
            <div
              className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-6"
              style={{
                background: "rgba(0,0,0,0.6)",
                backdropFilter: "blur(8px)",
              }}
            >
              <div className="relative flex items-center justify-center">
                {[150, 200].map((size, i) => (
                  <span
                    key={size}
                    className="absolute rounded-full"
                    style={{
                      width: size,
                      height: size,
                      border: "1.5px solid rgba(74,222,128,0.35)",
                      animation: `vcRipple ${1.1 + i * 0.4}s ease-out infinite`,
                    }}
                  />
                ))}
                <img
                  src={avatar}
                  alt={displayName}
                  className="w-28 h-28 rounded-full object-cover object-top relative z-10"
                  style={{
                    border: "3px solid rgba(74,222,128,0.6)",
                    boxShadow: "0 0 50px rgba(74,222,128,0.4)",
                  }}
                />
                <div
                  className="absolute -bottom-1 -right-1 z-20 w-9 h-9 rounded-full flex items-center justify-center font-black text-sm"
                  style={{ background: "#22c55e", border: "2px solid #0f0f0f" }}
                >
                  ✓
                </div>
              </div>
              <div className="text-center space-y-1">
                <p className="text-green-400 font-black text-xs tracking-[0.5em] uppercase animate-pulse">
                  Call Accepted
                </p>
                <p className="text-white font-black text-xl tracking-widest uppercase">
                  {displayName}
                </p>
                <p
                  className="font-mono text-xs"
                  style={{ color: "rgba(255,255,255,0.3)" }}
                >
                  Connecting video stream…
                </p>
              </div>
              <div
                className="w-52 h-0.5 rounded-full overflow-hidden"
                style={{ background: "rgba(255,255,255,0.08)" }}
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    background: "linear-gradient(90deg, #22c55e, #86efac)",
                    animation: "vcProgress 1.8s ease-out forwards",
                  }}
                />
              </div>
            </div>
          )}

          {/* -- CONNECTED STATE (Zego + HUD) -- */}
          {status === "connected" && (
            <div
              className="relative w-full flex flex-col"
              style={{ minHeight: 560 }}
            >
              {/* HUD top bar */}
              <div
                className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-5 py-3"
                style={{
                  background:
                    "linear-gradient(to bottom, rgba(0,0,0,0.75), transparent)",
                  pointerEvents: "none",
                }}
              >
                {/* Left: caller info */}
                <div className="flex items-center gap-3">
                  <img
                    src={avatar}
                    alt={displayName}
                    className="w-9 h-9 rounded-full object-cover object-top"
                    style={{ border: "1.5px solid rgba(255,255,255,0.2)" }}
                  />
                  <div>
                    <p className="text-white text-xs font-black tracking-widest uppercase leading-none">
                      {displayName}
                    </p>
                    <p
                      className="font-mono text-[9px] mt-0.5"
                      style={{ color: "rgba(255,255,255,0.3)" }}
                    >
                      {player.id.slice(0, 16)}…
                    </p>
                  </div>
                </div>

                {/* Right: live timer with 60s limit + onExpire backup */}
                <div
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full"
                  style={{
                    background: "rgba(0,0,0,0.55)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    pointerEvents: "none",
                  }}
                >
                  {remoteJoined ? (
                    <CallTimer
                      running={remoteJoined}
                      limitSeconds={CALL_TIME_LIMIT_SECONDS}
                      onExpire={handleTimerExpire}
                    />
                  ) : (
                    <span
                      className="font-mono text-xs"
                      style={{ color: "rgba(255,255,255,0.35)" }}
                    >
                      Waiting…
                    </span>
                  )}
                </div>
              </div>

              {/* Quality badge */}
              {remoteJoined && (
                <div
                  className="absolute top-14 right-4 z-20 flex items-center gap-1.5 px-2 py-1 rounded-full"
                  style={{
                    background: "rgba(0,0,0,0.5)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <span className="text-green-400 text-[9px] font-black tracking-widest uppercase">
                    HD LIVE
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                </div>
              )}

              {/* Zego container — receives ref callback */}
              <ZegoRoom
                roomId={callRoomId}
                userId={hostUserId}
                userName={hostUserName}
                onLeave={handleZegoLeave}
                onRemoteUserJoined={handleRemoteJoined}
                zegoRefCallback={handleZegoRef}
              />

              {/* Bottom gradient fade */}
              <div
                className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none z-10"
                style={{
                  background:
                    "linear-gradient(to top, rgba(0,0,0,0.6), transparent)",
                }}
              />
            </div>
          )}

          {/* -- CANCELLED STATE -- */}
          {status === "cancelled" && (
            <div
              className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-5"
              style={{ background: "rgba(0,0,0,0.97)" }}
            >
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center text-4xl"
                style={{
                  background: "rgba(239,68,68,0.12)",
                  border: "1px solid rgba(239,68,68,0.3)",
                }}
              >
                🚫
              </div>
              <div className="text-center space-y-1.5">
                <p className="text-white font-black text-xl tracking-widest uppercase">
                  Call Cancelled
                </p>
                <p
                  className="font-mono text-xs"
                  style={{ color: "rgba(255,255,255,0.3)" }}
                >
                  You ended the call before they answered
                </p>
              </div>
            </div>
          )}

          {/* -- REJECTED STATE -- */}
          {status === "rejected" && (
            <div
              className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-6"
              style={{
                background: "rgba(0,0,0,0.93)",
                backdropFilter: "blur(8px)",
              }}
            >
              <div className="relative flex items-center justify-center">
                {[150, 200].map((size, i) => (
                  <span
                    key={size}
                    className="absolute rounded-full"
                    style={{
                      width: size,
                      height: size,
                      border: "1px solid rgba(239,68,68,0.2)",
                      animation: `vcRipple ${1.3 + i * 0.5}s ease-out infinite`,
                    }}
                  />
                ))}
                <img
                  src={avatar}
                  alt={displayName}
                  className="w-28 h-28 rounded-full object-cover object-top relative z-10 grayscale opacity-40"
                  style={{ border: "3px solid rgba(239,68,68,0.4)" }}
                />
                <div
                  className="absolute -bottom-1 -right-1 z-20 w-8 h-8 rounded-full flex items-center justify-center font-black text-sm"
                  style={{ background: "#dc2626", border: "2px solid #0f0f0f" }}
                >
                  ✕
                </div>
              </div>
              <div className="text-center space-y-2">
                <p className="text-red-400 font-black text-xs tracking-[0.5em] uppercase animate-pulse">
                  Call Declined
                </p>
                <p className="text-white font-black text-xl tracking-widest uppercase">
                  {displayName}
                </p>
                <p
                  className="font-mono text-sm"
                  style={{ color: "rgba(255,255,255,0.3)" }}
                >
                  is not available right now
                </p>
              </div>
              <div className="flex items-center gap-2">
                {[0, 200, 400].map((d) => (
                  <span
                    key={d}
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                      background: "rgba(255,255,255,0.2)",
                      animation: `vcBounce 1.2s ease-in-out infinite`,
                      animationDelay: `${d}ms`,
                    }}
                  />
                ))}
                <span
                  className="font-mono text-[10px] ml-1 tracking-widest"
                  style={{ color: "rgba(255,255,255,0.2)" }}
                >
                  closing…
                </span>
              </div>
            </div>
          )}

          {/* -- ENDED STATE -- */}
          {status === "ended" && (
            <div
              className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-5"
              style={{ background: "rgba(0,0,0,0.97)" }}
            >
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center text-4xl"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                📵
              </div>
              <div className="text-center space-y-1.5">
                <p className="text-white font-black text-xl tracking-widest uppercase">
                  Call Ended
                </p>
                <p
                  className="font-mono text-xs"
                  style={{ color: "rgba(255,255,255,0.3)" }}
                >
                  Connection closed
                </p>
              </div>
            </div>
          )}

          {/* -- TIMEOUT STATE (NEW) -- */}
          {status === "timeout" && (
            <div
              className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-5"
              style={{ background: "rgba(0,0,0,0.97)" }}
            >
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center text-4xl"
                style={{
                  background: "rgba(239,68,68,0.12)",
                  border: "1px solid rgba(239,68,68,0.4)",
                }}
              >
                ⏰
              </div>
              <div className="text-center space-y-1.5">
                <p className="text-red-400 font-black text-xl tracking-widest uppercase animate-pulse">
                  Time's Up!
                </p>
                <p
                  className="font-mono text-xs"
                  style={{ color: "rgba(255,255,255,0.3)" }}
                >
                  60-second call limit reached — call ended automatically
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Global keyframes */}
      <style>{`
        @keyframes vcRipple {
          0%   { transform: scale(0.85); opacity: 0.7; }
          100% { transform: scale(1.25); opacity: 0; }
        }
        @keyframes vcBounce {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50%       { transform: translateY(-5px); opacity: 1; }
        }
        @keyframes vcProgress {
          from { width: 0%; }
          to   { width: 100%; }
        }
      `}</style>
    </>
  );
}
