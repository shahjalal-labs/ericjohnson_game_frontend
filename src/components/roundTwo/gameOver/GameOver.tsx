/* eslint-disable @typescript-eslint/no-explicit-any */
// "use client";

// import { useRouter, useSearchParams } from "next/navigation";
// import { useEffect, useState, Suspense } from "react";
// import { useSelector } from "react-redux";

// // --- Types --------------------------------------------------------------------
// interface Player {
//   id: string | number;
//   name: string;
//   avatar: string;
//   isWinner: boolean;
//   points?: number;
// }

// interface GameOverScreenProps {
//   players?: Player[];
//   winnerName?: string;
//   onPlayAgain?: () => void;
// }

// // --- Scoped style injection ---------------------------------------------------
// const STYLE_ID = "__game-over-screen-kf__";

// function injectStyles() {
//   if (typeof document === "undefined") return;
//   if (document.getElementById(STYLE_ID)) return;
//   const s = document.createElement("style");
//   s.id = STYLE_ID;
//   s.textContent = `
//     @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Orbitron:wght@700&family=Rajdhani:wght@600;700&display=swap');

//     @keyframes gos-crown-drop {
//       0%   { opacity:0; transform:translateY(-55px) rotate(-8deg) scale(0.55); }
//       65%  { transform:translateY(7px) rotate(3deg) scale(1.07); }
//       85%  { transform:translateY(-3px) rotate(-1deg) scale(1.01); }
//       100% { opacity:1; transform:translateY(0) rotate(0) scale(1); }
//     }
//     @keyframes gos-crown-float {
//       0%,100% { transform:translateY(0) rotate(-1.5deg); }
//       50%      { transform:translateY(-9px) rotate(1.5deg); }
//     }
//     @keyframes gos-fade-down {
//       from { opacity:0; transform:translateY(-28px); }
//       to   { opacity:1; transform:translateY(0); }
//     }
//     @keyframes gos-fade-up {
//       from { opacity:0; transform:translateY(22px); }
//       to   { opacity:1; transform:translateY(0); }
//     }
//     @keyframes gos-card-in {
//       from { opacity:0; transform:translateY(28px) scale(0.96); }
//       to   { opacity:1; transform:translateY(0) scale(1); }
//     }
//     @keyframes gos-winner-glow {
//       0%,100% { box-shadow:0 0 28px rgba(255,160,0,0.18), inset 0 0 18px rgba(255,160,0,0.05); }
//       50%      { box-shadow:0 0 55px rgba(255,160,0,0.38), inset 0 0 35px rgba(255,160,0,0.10); }
//     }
//     @keyframes gos-green-pulse {
//       0%,100% { text-shadow:0 0 8px rgba(74,222,128,0.4); }
//       50%      { text-shadow:0 0 24px rgba(74,222,128,0.9),0 0 48px rgba(74,222,128,0.3); }
//     }
//     @keyframes gos-conf {
//       0%   { transform:translateY(-10px) rotate(0deg); opacity:1; }
//       100% { transform:translateY(110vh) rotate(680deg); opacity:0; }
//     }
//     @keyframes gos-scan {
//       0%   { top:-180px; }
//       100% { top:100%; }
//     }
//     @keyframes gos-btn-appear {
//       from { opacity:0; transform:translateY(16px); }
//       to   { opacity:1; transform:translateY(0); }
//     }
//     @keyframes gos-coin-spin {
//       0%   { transform: rotateY(0deg) scale(1); }
//       45%  { transform: rotateY(180deg) scale(1.1); }
//       100% { transform: rotateY(360deg) scale(1); }
//     }
//     @keyframes gos-coin-bob {
//       0%,100% { transform: translateY(0px); }
//       50%      { transform: translateY(-10px); }
//     }
//     @keyframes gos-coin-glow {
//       0%,100% { filter: drop-shadow(0 0 12px rgba(255,200,0,0.6)) drop-shadow(0 6px 18px rgba(255,140,0,0.35)); }
//       50%      { filter: drop-shadow(0 0 30px rgba(255,225,0,1))   drop-shadow(0 6px 28px rgba(255,170,0,0.7)); }
//     }
//     @keyframes gos-points-pop {
//       0%   { opacity:0; transform:scale(0.3) translateY(16px); }
//       70%  { transform:scale(1.18) translateY(-5px); }
//       100% { opacity:1; transform:scale(1) translateY(0); }
//     }
//     @keyframes gos-points-shine {
//       0%,100% { text-shadow: 0 0 16px rgba(255,215,0,0.5), 0 3px 8px rgba(0,0,0,0.6); }
//       50%      { text-shadow: 0 0 38px rgba(255,215,0,1), 0 0 70px rgba(255,175,0,0.6), 0 3px 8px rgba(0,0,0,0.6); }
//     }
//     @keyframes gos-label-fade {
//       from { opacity:0; transform:translateY(8px); }
//       to   { opacity:1; transform:translateY(0); }
//     }
//     @keyframes gos-pts-card-glow {
//       0%,100% { box-shadow: 0 0 22px rgba(255,200,0,0.12), inset 0 0 14px rgba(255,180,0,0.04); }
//       50%      { box-shadow: 0 0 48px rgba(255,200,0,0.30), inset 0 0 28px rgba(255,180,0,0.10); }
//     }
//     @keyframes gos-coin-drop {
//       0%   { opacity:0; transform:translateY(-40px) scale(0.6); }
//       65%  { transform:translateY(6px) scale(1.06); }
//       85%  { transform:translateY(-3px) scale(0.99); }
//       100% { opacity:1; transform:translateY(0) scale(1); }
//     }

//     .gos-btn-replay:hover {
//       background: rgba(255,255,255,0.09) !important;
//       border-color: rgba(255,255,255,0.32) !important;
//       transform: translateY(-1px);
//     }
//     .gos-btn-replay:active { transform: translateY(0px) scale(0.98); }
//     .gos-btn-crown:hover {
//       transform: translateY(-2px) !important;
//       box-shadow: 0 7px 26px rgba(185,40,40,0.5) !important;
//     }
//     .gos-card-winner { animation: gos-winner-glow 3s ease-in-out infinite; }
//     .gos-pts-card    { animation: gos-pts-card-glow 3s ease-in-out 0.3s infinite; }

//     .gos-coin-drop-anim  { animation: gos-coin-drop 0.85s cubic-bezier(0.34,1.56,0.64,1) 0.9s both; }
//     .gos-coin-spin-anim  { animation: gos-coin-spin 3.5s ease-in-out 1.8s infinite; }
//     .gos-coin-bob-anim   { animation: gos-coin-bob  2.8s ease-in-out  1.8s infinite; }
//     .gos-coin-glow-anim  { animation: gos-coin-glow 2.6s ease-in-out  1.8s infinite; }

//     .gos-points-num {
//       animation:
//         gos-points-pop   0.8s cubic-bezier(0.34,1.56,0.64,1) 1.2s both,
//         gos-points-shine 3s  ease-in-out                      2.1s infinite;
//     }
//     .gos-pts-label    { animation: gos-label-fade 0.5s ease 1.5s both; }
//     .gos-pts-sublabel { animation: gos-label-fade 0.5s ease 1.65s both; }
//   `;
//   document.head.appendChild(s);
// }

// // --- Crown SVG ----------------------------------------------------------------
// function CrownSVG() {
//   return (
//     <svg
//       viewBox="0 0 100 72"
//       xmlns="http://www.w3.org/2000/svg"
//       style={{
//         width: "100%",
//         height: "100%",
//         filter: "drop-shadow(0 0 14px rgba(255,200,0,0.55))",
//       }}
//     >
//       <defs>
//         <linearGradient id="gos-cg1" x1="0%" y1="0%" x2="100%" y2="100%">
//           <stop offset="0%" stopColor="#FFE878" />
//           <stop offset="45%" stopColor="#FFD700" />
//           <stop offset="100%" stopColor="#A06800" />
//         </linearGradient>
//         <linearGradient id="gos-cg2" x1="0%" y1="0%" x2="0%" y2="100%">
//           <stop offset="0%" stopColor="#FFFBE0" stopOpacity="0.52" />
//           <stop offset="100%" stopColor="#FFD700" stopOpacity="0" />
//         </linearGradient>
//       </defs>
//       <path
//         d="M10 62 L16 24 L36 46 L50 8 L64 46 L84 24 L90 62Z"
//         fill="url(#gos-cg1)"
//         stroke="#8B6000"
//         strokeWidth="1"
//         strokeLinejoin="round"
//       />
//       <path
//         d="M10 62 L16 24 L36 46 L50 8 L64 46 L84 24 L90 62Z"
//         fill="url(#gos-cg2)"
//       />
//       <rect
//         x="10"
//         y="60"
//         width="80"
//         height="11"
//         rx="3"
//         fill="url(#gos-cg1)"
//         stroke="#8B6000"
//         strokeWidth="0.8"
//       />
//       <circle
//         cx="50"
//         cy="65"
//         r="4"
//         fill="#E84040"
//         stroke="#AA0000"
//         strokeWidth="0.6"
//       />
//       <circle
//         cx="26"
//         cy="65"
//         r="3"
//         fill="#4488FF"
//         stroke="#0033CC"
//         strokeWidth="0.6"
//       />
//       <circle
//         cx="74"
//         cy="65"
//         r="3"
//         fill="#44CC77"
//         stroke="#007733"
//         strokeWidth="0.6"
//       />
//       <circle
//         cx="50"
//         cy="9"
//         r="3"
//         fill="#E84040"
//         stroke="#AA0000"
//         strokeWidth="0.6"
//       />
//       <ellipse
//         cx="37"
//         cy="34"
//         rx="6"
//         ry="3.5"
//         fill="white"
//         fillOpacity="0.17"
//         transform="rotate(-22 37 34)"
//       />
//     </svg>
//   );
// }

// // --- Coin SVG -----------------------------------------------------------------
// function CoinSVG() {
//   return (
//     <svg
//       viewBox="0 0 120 120"
//       xmlns="http://www.w3.org/2000/svg"
//       className="gos-coin-spin-anim gos-coin-glow-anim"
//       style={{ width: "100%", height: "100%", display: "block" }}
//     >
//       <defs>
//         <radialGradient id="gos-coin-face" cx="38%" cy="32%" r="68%">
//           <stop offset="0%" stopColor="#FFFAC0" />
//           <stop offset="28%" stopColor="#FFD700" />
//           <stop offset="70%" stopColor="#C8860A" />
//           <stop offset="100%" stopColor="#7A4F00" />
//         </radialGradient>
//         <radialGradient id="gos-coin-edge" cx="50%" cy="60%" r="55%">
//           <stop offset="0%" stopColor="#B87800" />
//           <stop offset="100%" stopColor="#5A3500" />
//         </radialGradient>
//         <linearGradient id="gos-coin-shine" x1="10%" y1="8%" x2="58%" y2="55%">
//           <stop offset="0%" stopColor="white" stopOpacity="0.65" />
//           <stop offset="100%" stopColor="white" stopOpacity="0" />
//         </linearGradient>
//       </defs>

//       {/* Edge / depth */}
//       <ellipse cx="60" cy="66" rx="50" ry="50" fill="url(#gos-coin-edge)" />
//       {/* Face */}
//       <ellipse cx="60" cy="60" rx="50" ry="50" fill="url(#gos-coin-face)" />
//       {/* Outer rim */}
//       <ellipse
//         cx="60"
//         cy="60"
//         rx="50"
//         ry="50"
//         fill="none"
//         stroke="#8B6000"
//         strokeWidth="2.5"
//       />
//       {/* Inner rim */}
//       <ellipse
//         cx="60"
//         cy="60"
//         rx="43"
//         ry="43"
//         fill="none"
//         stroke="rgba(255,228,80,0.38)"
//         strokeWidth="1.5"
//       />
//       {/* Notch marks around rim */}
//       {Array.from({ length: 16 }, (_, i) => {
//         const a = (i / 16) * Math.PI * 2;
//         const x1 = 60 + 46 * Math.cos(a),
//           y1 = 60 + 46 * Math.sin(a);
//         const x2 = 60 + 49 * Math.cos(a),
//           y2 = 60 + 49 * Math.sin(a);
//         return (
//           <line
//             key={i}
//             x1={x1}
//             y1={y1}
//             x2={x2}
//             y2={y2}
//             stroke="rgba(120,80,0,0.55)"
//             strokeWidth="1.2"
//           />
//         );
//       })}
//       {/* $ shadow */}
//       <text
//         x="61"
//         y="79"
//         textAnchor="middle"
//         fontFamily="'Bebas Neue',Georgia,serif"
//         fontSize="56"
//         fontWeight="bold"
//         fill="#5A3500"
//         opacity="0.32"
//       >
//         $
//       </text>
//       {/* $ main */}
//       <text
//         x="60"
//         y="77"
//         textAnchor="middle"
//         fontFamily="'Bebas Neue',Georgia,serif"
//         fontSize="56"
//         fontWeight="bold"
//         fill="#FFFBE0"
//         opacity="0.92"
//       >
//         $
//       </text>
//       {/* Shine */}
//       <ellipse cx="60" cy="60" rx="50" ry="50" fill="url(#gos-coin-shine)" />
//       {/* Specular highlight */}
//       <ellipse
//         cx="42"
//         cy="36"
//         rx="15"
//         ry="8"
//         fill="white"
//         fillOpacity="0.32"
//         transform="rotate(-28 42 36)"
//       />
//     </svg>
//   );
// }

// // --- Confetti -----------------------------------------------------------------
// function Confetti() {
//   const colors = [
//     "#FFD700",
//     "#FF6B6B",
//     "#4ECDC4",
//     "#45B7D1",
//     "#96CEB4",
//     "#FF9FF3",
//     "#FFEAA7",
//   ];
//   const items = Array.from({ length: 22 }, (_, i) => ({
//     left: `${(i * 4.55 + Math.sin(i * 1.3) * 10 + 50) % 100}%`,
//     color: colors[i % colors.length],
//     size: 5 + (i % 4),
//     dur: `${3.5 + (i % 5) * 0.65}s`,
//     delay: `${(i * 0.28) % 4.5}s`,
//     isCircle: i % 3 !== 0,
//   }));
//   return (
//     <div
//       style={{
//         position: "absolute",
//         inset: 0,
//         pointerEvents: "none",
//         overflow: "hidden",
//         zIndex: 3,
//       }}
//     >
//       {items.map((c, i) => (
//         <div
//           key={i}
//           style={{
//             position: "absolute",
//             top: -12,
//             left: c.left,
//             width: c.size,
//             height: c.size,
//             borderRadius: c.isCircle ? "50%" : "2px",
//             background: c.color,
//             animation: `gos-conf ${c.dur} linear ${c.delay} infinite`,
//           }}
//         />
//       ))}
//     </div>
//   );
// }

// // --- Winner Card --------------------------------------------------------------
// function WinnerCard({ player, ready }: { player: Player; ready: boolean }) {
//   return (
//     <div
//       className="gos-card-winner"
//       style={{
//         flex: "1 1 0",
//         minWidth: 0,
//         borderRadius: 20,
//         overflow: "hidden",
//         padding: "20px 20px 22px",
//         position: "relative",
//         boxSizing: "border-box",
//         border: "1.5px solid rgba(255,165,0,0.48)",
//         background: "rgba(255,150,0,0.06)",
//         animation: ready
//           ? "gos-card-in 0.7s cubic-bezier(0.34,1.56,0.64,1) 0.55s both"
//           : "none",
//       }}
//     >
//       {/* Gold corner accents */}
//       {[
//         { top: 12, left: 12, borderWidth: "2px 0 0 2px" },
//         { top: 12, right: 12, borderWidth: "2px 2px 0 0" },
//         { bottom: 12, left: 12, borderWidth: "0 0 2px 2px" },
//         { bottom: 12, right: 12, borderWidth: "0 2px 2px 0" },
//       ].map((c, i) => (
//         <div
//           key={i}
//           style={{
//             position: "absolute",
//             width: 16,
//             height: 16,
//             zIndex: 5,
//             border: `${c.borderWidth} solid rgba(255,185,0,0.72)`,
//             ...c,
//           }}
//         />
//       ))}

//       {/* Player name */}
//       <p
//         style={{
//           fontFamily: "'Orbitron', monospace",
//           fontSize: 11,
//           letterSpacing: "0.28em",
//           color: "rgba(200,200,200,0.6)",
//           textAlign: "center",
//           textTransform: "uppercase",
//           margin: "0 0 14px",
//         }}
//       >
//         {player.name}
//       </p>

//       {/* Avatar */}
//       <div
//         style={{
//           position: "relative",
//           borderRadius: 14,
//           overflow: "hidden",
//           aspectRatio: "4/3",
//           marginBottom: 16,
//           background: "#1a1a28",
//         }}
//       >
//         {player.avatar ? (
//           <img
//             src={player.avatar}
//             alt={player.name}
//             style={{
//               width: "100%",
//               height: "100%",
//               objectFit: "cover",
//               objectPosition: "center top",
//               display: "block",
//             }}
//             onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
//               (e.target as HTMLImageElement).style.display = "none";
//             }}
//           />
//         ) : (
//           <div
//             style={{
//               width: "100%",
//               height: "100%",
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               background: "linear-gradient(135deg,#7A0000 0%,#B8292B 100%)",
//               fontSize: 64,
//               fontFamily: "'Bebas Neue', sans-serif",
//               color: "rgba(255,255,255,0.85)",
//               letterSpacing: "0.05em",
//             }}
//           >
//             {player.name.charAt(0).toUpperCase()}
//           </div>
//         )}
//         <div
//           style={{
//             position: "absolute",
//             inset: 0,
//             pointerEvents: "none",
//             background:
//               "linear-gradient(to top, rgba(90,50,0,0.28) 0%, transparent 55%)",
//           }}
//         />
//       </div>

//       {/* Crown Winner badge */}
//       <p
//         className="gos-btn-crown"
//         style={{
//           display: "block",
//           width: "100%",
//           textAlign: "center",
//           fontFamily: "'Bebas Neue', sans-serif",
//           letterSpacing: "0.22em",
//           fontSize: 14,
//           color: "white",
//           borderRadius: 10,
//           padding: "10px 0",
//           border: "1px solid rgba(220,90,80,0.45)",
//           background:
//             "linear-gradient(135deg,#7A0000 0%,#B8292B 50%,#7A0000 100%)",
//           position: "relative",
//           overflow: "hidden",
//           transition: "transform 0.2s ease, box-shadow 0.2s ease",
//           margin: 0,
//         }}
//       >
//         ♛ &nbsp;Tournament Winner
//       </p>
//     </div>
//   );
// }

// // --- Points Card -------------------------------------------------------------
// function PointsCard({ points, ready }: { points: number; ready: boolean }) {
//   return (
//     <div
//       className="gos-pts-card"
//       style={{
//         flex: "1 1 0",
//         minWidth: 0,
//         borderRadius: 20,
//         padding: "20px 20px 22px",
//         position: "relative",
//         boxSizing: "border-box",
//         border: "1.5px solid rgba(255,200,0,0.38)",
//         background: "rgba(255,185,0,0.05)",
//         display: "flex",
//         flexDirection: "column",
//         alignItems: "center",
//         justifyContent: "center",
//         gap: 0,
//         overflow: "hidden",
//         animation: ready
//           ? "gos-card-in 0.7s cubic-bezier(0.34,1.56,0.64,1) 0.72s both"
//           : "none",
//       }}
//     >
//       {/* Gold corner accents */}
//       {[
//         { top: 12, left: 12, borderWidth: "2px 0 0 2px" },
//         { top: 12, right: 12, borderWidth: "2px 2px 0 0" },
//         { bottom: 12, left: 12, borderWidth: "0 0 2px 2px" },
//         { bottom: 12, right: 12, borderWidth: "0 2px 2px 0" },
//       ].map((c, i) => (
//         <div
//           key={i}
//           style={{
//             position: "absolute",
//             width: 16,
//             height: 16,
//             zIndex: 5,
//             border: `${c.borderWidth} solid rgba(255,185,0,0.72)`,
//             ...c,
//           }}
//         />
//       ))}

//       {/* Background radial glow */}
//       <div
//         style={{
//           position: "absolute",
//           inset: 0,
//           pointerEvents: "none",
//           background:
//             "radial-gradient(ellipse at 50% 42%, rgba(255,210,0,0.11) 0%, transparent 70%)",
//         }}
//       />

//       {/* Label top */}
//       <p
//         className="gos-pts-label"
//         style={{
//           fontFamily: "'Orbitron', monospace",
//           fontSize: 10,
//           letterSpacing: "0.3em",
//           color: "rgba(255,210,80,0.6)",
//           textTransform: "uppercase",
//           margin: "0 0 18px",
//           position: "relative",
//           zIndex: 1,
//         }}
//       >
//         Score
//       </p>

//       {/* Big coin — drops in then bobs */}
//       <div
//         className="gos-coin-drop-anim"
//         style={{
//           width: 130,
//           height: 130,
//           position: "relative",
//           zIndex: 1,
//           marginBottom: 20,
//         }}
//       >
//         <div
//           className="gos-coin-bob-anim"
//           style={{ width: "100%", height: "100%" }}
//         >
//           <CoinSVG />
//         </div>
//       </div>

//       {/* Points number */}
//       <span
//         className="gos-points-num"
//         style={{
//           fontFamily: "'Bebas Neue', sans-serif",
//           fontSize: 88,
//           lineHeight: 1,
//           color: "#FFD700",
//           letterSpacing: "0.04em",
//           position: "relative",
//           zIndex: 1,
//         }}
//       >
//         {points}
//       </span>

//       {/* pts earned label */}
//       <span
//         className="gos-pts-sublabel"
//         style={{
//           fontFamily: "'Rajdhani', sans-serif",
//           fontSize: 12,
//           fontWeight: 600,
//           letterSpacing: "0.22em",
//           color: "rgba(255,200,80,0.5)",
//           textTransform: "uppercase",
//           marginTop: 6,
//           position: "relative",
//           zIndex: 1,
//         }}
//       >
//         pts earned
//       </span>

//       {/* Decorative bottom line */}
//       <div
//         style={{
//           width: "60%",
//           height: 1,
//           marginTop: 20,
//           background:
//             "linear-gradient(90deg, transparent, rgba(255,185,0,0.45), transparent)",
//           position: "relative",
//           zIndex: 1,
//         }}
//       />
//     </div>
//   );
// }

// // --- Inner screen -------------------------------------------------------------
// function GameOverInner({
//   players,
//   winnerName,
//   onPlayAgain,
// }: GameOverScreenProps) {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const [ready, setReady] = useState(false);

//   const { winner } = useSelector((state: any) => state.gameOver);

//   const urlWinnerName = searchParams.get("winnerName") ?? "";
//   const urlWinnerAvatar = searchParams.get("winnerAvatar") ?? "";
//   const urlWinnerId = searchParams.get("winnerId") ?? "";
//   const urlWinnerPoints = searchParams.get("winnerPoints") ?? "";

//   const urlWinner: Player | null = urlWinnerId
//     ? {
//         id: urlWinnerId,
//         name: urlWinnerName || "Champion",
//         avatar: urlWinnerAvatar,
//         isWinner: true,
//         points: urlWinnerPoints ? Number(urlWinnerPoints) : 0,
//       }
//     : null;

//   const reduxWinner: Player | null = winner
//     ? {
//         id: winner.id,
//         name: winner.name,
//         avatar: winner.avatar,
//         isWinner: true,
//         points: winner.points ?? 0,
//       }
//     : null;

//   const resolvedWinner: Player | undefined =
//     urlWinner ?? reduxWinner ?? (players ?? []).find((p) => p.isWinner);

//   const displayWinnerName = winnerName ?? resolvedWinner?.name ?? "—";

//   useEffect(() => {
//     injectStyles();
//     const t = setTimeout(() => setReady(true), 50);
//     return () => clearTimeout(t);
//   }, []);

//   const handlePlayAgain = () => {
//     if (onPlayAgain) {
//       onPlayAgain();
//     } else {
//       router.push("/");
//     }
//   };

//   return (
//     <div style={{ position: "relative" }}>
//       {/* Scanline sweep */}
//       <div
//         style={{
//           position: "absolute",
//           left: 0,
//           width: "100%",
//           height: 180,
//           background:
//             "linear-gradient(transparent,rgba(255,255,255,0.024) 50%,transparent)",
//           pointerEvents: "none",
//           zIndex: 2,
//           animation: "gos-scan 7s linear infinite",
//         }}
//       />

//       {ready && <Confetti />}

//       <div
//         style={{
//           position: "relative",
//           marginTop: "20px",
//           zIndex: 10,
//           flex: 1,
//           display: "flex",
//           flexDirection: "column",
//           alignItems: "center",
//           justifyContent: "center",
//           padding: "24px 16px 40px",
//           boxSizing: "border-box",
//         }}
//       >
//         {/* Crown */}
//         <div
//           style={{
//             width: 110,
//             height: 78,
//             position: "relative",
//             marginBottom: -6,
//             animation: ready
//               ? "gos-crown-drop 0.9s cubic-bezier(0.34,1.56,0.64,1) 0.08s both, gos-crown-float 3.5s ease-in-out 1s infinite"
//               : "none",
//           }}
//         >
//           <div
//             style={{
//               position: "absolute",
//               inset: -22,
//               background:
//                 "radial-gradient(circle,rgba(255,200,0,0.22) 0%,transparent 70%)",
//               borderRadius: "50%",
//               pointerEvents: "none",
//             }}
//           />
//           <CrownSVG />
//         </div>

//         {/* Title */}
//         <h1
//           style={{
//             fontFamily: "'Bebas Neue', sans-serif",
//             fontSize: "clamp(52px, 11vw, 76px)",
//             letterSpacing: "0.12em",
//             background: "linear-gradient(180deg,#FFFFFF 0%,#BBBBBB 100%)",
//             WebkitBackgroundClip: "text",
//             WebkitTextFillColor: "transparent",
//             backgroundClip: "text",
//             margin: "10px 0 4px",
//             lineHeight: 1,
//             animation: ready
//               ? "gos-fade-down 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.22s both"
//               : "none",
//           }}
//         >
//           Game Over
//         </h1>

//         {/* Winner name */}
//         <p
//           style={{
//             fontFamily: "'Orbitron', monospace",
//             fontSize: "clamp(11px,2.4vw,15px)",
//             fontWeight: 700,
//             letterSpacing: "0.14em",
//             color: "#4ADE80",
//             marginBottom: 28,
//             animation: ready
//               ? "gos-fade-up 0.6s ease 0.42s both, gos-green-pulse 2s ease-in-out 1s infinite"
//               : "none",
//           }}
//         >
//           ✦ &nbsp;Winner: {displayWinnerName}&nbsp; ✦
//         </p>

//         {/* -- Side-by-side cards --------------------------------------------- */}
//         {resolvedWinner && (
//           <div
//             style={{
//               width: "100%",
//               maxWidth: 820,
//               display: "flex",
//               flexDirection: "row",
//               gap: 16,
//               alignItems: "stretch",
//               animation: ready ? "gos-fade-up 0.6s ease 0.6s both" : "none",
//             }}
//           >
//             {/* Left — Winner card */}
//             <WinnerCard player={resolvedWinner} ready={ready} />

//             {/* Right — Points card */}
//             <PointsCard points={resolvedWinner.points ?? 0} ready={ready} />
//           </div>
//         )}

//         {/* Play Again */}
//         <button
//           className="gos-btn-replay"
//           onClick={handlePlayAgain}
//           style={{
//             marginTop: 28,
//             fontFamily: "'Bebas Neue', sans-serif",
//             letterSpacing: "0.22em",
//             fontSize: 13,
//             color: "rgba(255,255,255,0.75)",
//             borderRadius: 10,
//             padding: "10px 40px",
//             cursor: "pointer",
//             border: "1px solid rgba(255,255,255,0.15)",
//             background: "transparent",
//             transition:
//               "background 0.2s ease, border-color 0.2s ease, transform 0.15s ease",
//             animation: ready ? "gos-btn-appear 0.6s ease 0.85s both" : "none",
//           }}
//         >
//           ↺ &nbsp;Play Again
//         </button>
//       </div>
//     </div>
//   );
// }

// // --- Main export --------------------------------------------------------------
// export default function GameOverScreen(props: GameOverScreenProps) {
//   return (
//     <Suspense fallback={null}>
//       <GameOverInner {...props} />
//     </Suspense>
//   );
// }

"use client";

import { resetGameOver } from "@/redux/features/winner/Gameoverslice";
import { useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { useDispatch, useSelector } from "react-redux";

// --- Scoped style injection ---------------------------------------------------
const STYLE_ID = "__game-over-screen-kf__";

function injectStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById(STYLE_ID)) return;
  const s = document.createElement("style");
  s.id = STYLE_ID;
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Orbitron:wght@700&family=Rajdhani:wght@600;700&display=swap');

    @keyframes gos-crown-drop {
      0%   { opacity:0; transform:translateY(-55px) rotate(-8deg) scale(0.55); }
      65%  { transform:translateY(7px) rotate(3deg) scale(1.07); }
      85%  { transform:translateY(-3px) rotate(-1deg) scale(1.01); }
      100% { opacity:1; transform:translateY(0) rotate(0) scale(1); }
    }
    @keyframes gos-crown-float {
      0%,100% { transform:translateY(0) rotate(-1.5deg); }
      50%      { transform:translateY(-9px) rotate(1.5deg); }
    }
    @keyframes gos-fade-down {
      from { opacity:0; transform:translateY(-28px); }
      to   { opacity:1; transform:translateY(0); }
    }
    @keyframes gos-fade-up {
      from { opacity:0; transform:translateY(22px); }
      to   { opacity:1; transform:translateY(0); }
    }
    @keyframes gos-card-in {
      from { opacity:0; transform:translateY(28px) scale(0.96); }
      to   { opacity:1; transform:translateY(0) scale(1); }
    }
    @keyframes gos-winner-glow {
      0%,100% { box-shadow:0 0 28px rgba(255,160,0,0.18), inset 0 0 18px rgba(255,160,0,0.05); }
      50%      { box-shadow:0 0 55px rgba(255,160,0,0.38), inset 0 0 35px rgba(255,160,0,0.10); }
    }
    @keyframes gos-green-pulse {
      0%,100% { text-shadow:0 0 8px rgba(74,222,128,0.4); }
      50%      { text-shadow:0 0 24px rgba(74,222,128,0.9),0 0 48px rgba(74,222,128,0.3); }
    }
    @keyframes gos-conf {
      0%   { transform:translateY(-10px) rotate(0deg); opacity:1; }
      100% { transform:translateY(110vh) rotate(680deg); opacity:0; }
    }
    @keyframes gos-scan {
      0%   { top:-180px; }
      100% { top:100%; }
    }
    @keyframes gos-btn-appear {
      from { opacity:0; transform:translateY(16px); }
      to   { opacity:1; transform:translateY(0); }
    }
    @keyframes gos-coin-spin {
      0%   { transform: rotateY(0deg) scale(1); }
      45%  { transform: rotateY(180deg) scale(1.1); }
      100% { transform: rotateY(360deg) scale(1); }
    }
    @keyframes gos-coin-bob {
      0%,100% { transform: translateY(0px); }
      50%      { transform: translateY(-10px); }
    }
    @keyframes gos-coin-glow {
      0%,100% { filter: drop-shadow(0 0 12px rgba(255,200,0,0.6)) drop-shadow(0 6px 18px rgba(255,140,0,0.35)); }
      50%      { filter: drop-shadow(0 0 30px rgba(255,225,0,1))   drop-shadow(0 6px 28px rgba(255,170,0,0.7)); }
    }
    @keyframes gos-points-pop {
      0%   { opacity:0; transform:scale(0.3) translateY(16px); }
      70%  { transform:scale(1.18) translateY(-5px); }
      100% { opacity:1; transform:scale(1) translateY(0); }
    }
    @keyframes gos-points-shine {
      0%,100% { text-shadow: 0 0 16px rgba(255,215,0,0.5), 0 3px 8px rgba(0,0,0,0.6); }
      50%      { text-shadow: 0 0 38px rgba(255,215,0,1), 0 0 70px rgba(255,175,0,0.6), 0 3px 8px rgba(0,0,0,0.6); }
    }
    @keyframes gos-label-fade {
      from { opacity:0; transform:translateY(8px); }
      to   { opacity:1; transform:translateY(0); }
    }
    @keyframes gos-pts-card-glow {
      0%,100% { box-shadow: 0 0 22px rgba(255,200,0,0.12), inset 0 0 14px rgba(255,180,0,0.04); }
      50%      { box-shadow: 0 0 48px rgba(255,200,0,0.30), inset 0 0 28px rgba(255,180,0,0.10); }
    }
    @keyframes gos-coin-drop {
      0%   { opacity:0; transform:translateY(-40px) scale(0.6); }
      65%  { transform:translateY(6px) scale(1.06); }
      85%  { transform:translateY(-3px) scale(0.99); }
      100% { opacity:1; transform:translateY(0) scale(1); }
    }

    .gos-btn-replay:hover {
      background: rgba(255,255,255,0.09) !important;
      border-color: rgba(255,255,255,0.32) !important;
      transform: translateY(-1px);
    }
    .gos-btn-replay:active { transform: translateY(0px) scale(0.98); }
    .gos-btn-crown:hover {
      transform: translateY(-2px) !important;
      box-shadow: 0 7px 26px rgba(185,40,40,0.5) !important;
    }
    .gos-card-winner { animation: gos-winner-glow 3s ease-in-out infinite; }
    .gos-pts-card    { animation: gos-pts-card-glow 3s ease-in-out 0.3s infinite; }

    .gos-coin-drop-anim { animation: gos-coin-drop 0.85s cubic-bezier(0.34,1.56,0.64,1) 0.9s both; }
    .gos-coin-spin-anim { animation: gos-coin-spin 3.5s ease-in-out 1.8s infinite; }
    .gos-coin-bob-anim  { animation: gos-coin-bob  2.8s ease-in-out 1.8s infinite; }
    .gos-coin-glow-anim { animation: gos-coin-glow 2.6s ease-in-out 1.8s infinite; }

    .gos-points-num {
      animation:
        gos-points-pop   0.8s cubic-bezier(0.34,1.56,0.64,1) 1.2s both,
        gos-points-shine 3s  ease-in-out                      2.1s infinite;
    }
    .gos-pts-label    { animation: gos-label-fade 0.5s ease 1.5s both; }
    .gos-pts-sublabel { animation: gos-label-fade 0.5s ease 1.65s both; }
  `;
  document.head.appendChild(s);
}

// --- Crown SVG ----------------------------------------------------------------
function CrownSVG() {
  return (
    <svg
      viewBox="0 0 100 72"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        width: "100%",
        height: "100%",
        filter: "drop-shadow(0 0 14px rgba(255,200,0,0.55))",
      }}
    >
      <defs>
        <linearGradient id="gos-cg1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFE878" />
          <stop offset="45%" stopColor="#FFD700" />
          <stop offset="100%" stopColor="#A06800" />
        </linearGradient>
        <linearGradient id="gos-cg2" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFBE0" stopOpacity="0.52" />
          <stop offset="100%" stopColor="#FFD700" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M10 62 L16 24 L36 46 L50 8 L64 46 L84 24 L90 62Z"
        fill="url(#gos-cg1)"
        stroke="#8B6000"
        strokeWidth="1"
        strokeLinejoin="round"
      />
      <path
        d="M10 62 L16 24 L36 46 L50 8 L64 46 L84 24 L90 62Z"
        fill="url(#gos-cg2)"
      />
      <rect
        x="10"
        y="60"
        width="80"
        height="11"
        rx="3"
        fill="url(#gos-cg1)"
        stroke="#8B6000"
        strokeWidth="0.8"
      />
      <circle
        cx="50"
        cy="65"
        r="4"
        fill="#E84040"
        stroke="#AA0000"
        strokeWidth="0.6"
      />
      <circle
        cx="26"
        cy="65"
        r="3"
        fill="#4488FF"
        stroke="#0033CC"
        strokeWidth="0.6"
      />
      <circle
        cx="74"
        cy="65"
        r="3"
        fill="#44CC77"
        stroke="#007733"
        strokeWidth="0.6"
      />
      <circle
        cx="50"
        cy="9"
        r="3"
        fill="#E84040"
        stroke="#AA0000"
        strokeWidth="0.6"
      />
      <ellipse
        cx="37"
        cy="34"
        rx="6"
        ry="3.5"
        fill="white"
        fillOpacity="0.17"
        transform="rotate(-22 37 34)"
      />
    </svg>
  );
}

// --- Coin SVG -----------------------------------------------------------------
function CoinSVG() {
  return (
    <svg
      viewBox="0 0 120 120"
      xmlns="http://www.w3.org/2000/svg"
      className="gos-coin-spin-anim gos-coin-glow-anim"
      style={{ width: "100%", height: "100%", display: "block" }}
    >
      <defs>
        <radialGradient id="gos-coin-face" cx="38%" cy="32%" r="68%">
          <stop offset="0%" stopColor="#FFFAC0" />
          <stop offset="28%" stopColor="#FFD700" />
          <stop offset="70%" stopColor="#C8860A" />
          <stop offset="100%" stopColor="#7A4F00" />
        </radialGradient>
        <radialGradient id="gos-coin-edge" cx="50%" cy="60%" r="55%">
          <stop offset="0%" stopColor="#B87800" />
          <stop offset="100%" stopColor="#5A3500" />
        </radialGradient>
        <linearGradient id="gos-coin-shine" x1="10%" y1="8%" x2="58%" y2="55%">
          <stop offset="0%" stopColor="white" stopOpacity="0.65" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>
      </defs>
      <ellipse cx="60" cy="66" rx="50" ry="50" fill="url(#gos-coin-edge)" />
      <ellipse cx="60" cy="60" rx="50" ry="50" fill="url(#gos-coin-face)" />
      <ellipse
        cx="60"
        cy="60"
        rx="50"
        ry="50"
        fill="none"
        stroke="#8B6000"
        strokeWidth="2.5"
      />
      <ellipse
        cx="60"
        cy="60"
        rx="43"
        ry="43"
        fill="none"
        stroke="rgba(255,228,80,0.38)"
        strokeWidth="1.5"
      />
      {Array.from({ length: 16 }, (_, i) => {
        const a = (i / 16) * Math.PI * 2;
        const x1 = 60 + 46 * Math.cos(a),
          y1 = 60 + 46 * Math.sin(a);
        const x2 = 60 + 49 * Math.cos(a),
          y2 = 60 + 49 * Math.sin(a);
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="rgba(120,80,0,0.55)"
            strokeWidth="1.2"
          />
        );
      })}
      <text
        x="61"
        y="79"
        textAnchor="middle"
        fontFamily="'Bebas Neue',Georgia,serif"
        fontSize="56"
        fontWeight="bold"
        fill="#5A3500"
        opacity="0.32"
      >
        $
      </text>
      <text
        x="60"
        y="77"
        textAnchor="middle"
        fontFamily="'Bebas Neue',Georgia,serif"
        fontSize="56"
        fontWeight="bold"
        fill="#FFFBE0"
        opacity="0.92"
      >
        $
      </text>
      <ellipse cx="60" cy="60" rx="50" ry="50" fill="url(#gos-coin-shine)" />
      <ellipse
        cx="42"
        cy="36"
        rx="15"
        ry="8"
        fill="white"
        fillOpacity="0.32"
        transform="rotate(-28 42 36)"
      />
    </svg>
  );
}

// --- Confetti -----------------------------------------------------------------
function Confetti() {
  const colors = [
    "#FFD700",
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#96CEB4",
    "#FF9FF3",
    "#FFEAA7",
  ];
  const items = Array.from({ length: 22 }, (_, i) => ({
    left: `${(i * 4.55 + Math.sin(i * 1.3) * 10 + 50) % 100}%`,
    color: colors[i % colors.length],
    size: 5 + (i % 4),
    dur: `${3.5 + (i % 5) * 0.65}s`,
    delay: `${(i * 0.28) % 4.5}s`,
    isCircle: i % 3 !== 0,
  }));
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        overflow: "hidden",
        zIndex: 3,
      }}
    >
      {items.map((c, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: -12,
            left: c.left,
            width: c.size,
            height: c.size,
            borderRadius: c.isCircle ? "50%" : "2px",
            background: c.color,
            animation: `gos-conf ${c.dur} linear ${c.delay} infinite`,
          }}
        />
      ))}
    </div>
  );
}

// --- Winner Card --------------------------------------------------------------
function WinnerCard({
  name,
  avatar,
  ready,
}: {
  name: string;
  avatar: string;
  ready: boolean;
}) {
  return (
    <div
      className="gos-card-winner"
      style={{
        flex: "1 1 0",
        minWidth: 0,
        borderRadius: 20,
        overflow: "hidden",
        padding: "20px 20px 22px",
        position: "relative",
        boxSizing: "border-box",
        border: "1.5px solid rgba(255,165,0,0.48)",
        background: "rgba(255,150,0,0.06)",
        animation: ready
          ? "gos-card-in 0.7s cubic-bezier(0.34,1.56,0.64,1) 0.55s both"
          : "none",
      }}
    >
      {/* Gold corner accents */}
      {[
        { top: 12, left: 12, borderWidth: "2px 0 0 2px" },
        { top: 12, right: 12, borderWidth: "2px 2px 0 0" },
        { bottom: 12, left: 12, borderWidth: "0 0 2px 2px" },
        { bottom: 12, right: 12, borderWidth: "0 2px 2px 0" },
      ].map((c, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: 16,
            height: 16,
            zIndex: 5,
            border: `${c.borderWidth} solid rgba(255,185,0,0.72)`,
            ...c,
          }}
        />
      ))}

      {/* Player name */}
      <p
        style={{
          fontFamily: "'Orbitron', monospace",
          fontSize: 11,
          letterSpacing: "0.28em",
          color: "rgba(200,200,200,0.6)",
          textAlign: "center",
          textTransform: "uppercase",
          margin: "0 0 14px",
        }}
      >
        {name}
      </p>

      {/* Avatar */}
      <div
        style={{
          position: "relative",
          borderRadius: 14,
          overflow: "hidden",
          aspectRatio: "4/3",
          marginBottom: 16,
          background: "#1a1a28",
        }}
      >
        {avatar ? (
          <img
            src={avatar}
            alt={name}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center top",
              display: "block",
            }}
            onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg,#7A0000 0%,#B8292B 100%)",
              fontSize: 64,
              fontFamily: "'Bebas Neue', sans-serif",
              color: "rgba(255,255,255,0.85)",
              letterSpacing: "0.05em",
            }}
          >
            {name.charAt(0).toUpperCase()}
          </div>
        )}
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background:
              "linear-gradient(to top, rgba(90,50,0,0.28) 0%, transparent 55%)",
          }}
        />
      </div>

      {/* Crown Winner badge */}
      <p
        className="gos-btn-crown"
        style={{
          display: "block",
          width: "100%",
          textAlign: "center",
          fontFamily: "'Bebas Neue', sans-serif",
          letterSpacing: "0.22em",
          fontSize: 14,
          color: "white",
          borderRadius: 10,
          padding: "10px 0",
          border: "1px solid rgba(220,90,80,0.45)",
          background:
            "linear-gradient(135deg,#7A0000 0%,#B8292B 50%,#7A0000 100%)",
          position: "relative",
          overflow: "hidden",
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
          margin: 0,
        }}
      >
        ♛ &nbsp;Tournament Winner
      </p>
    </div>
  );
}

// --- Points Card --------------------------------------------------------------
function PointsCard({ points, ready }: { points: number; ready: boolean }) {
  return (
    <div
      className="gos-pts-card"
      style={{
        flex: "1 1 0",
        minWidth: 0,
        borderRadius: 20,
        padding: "20px 20px 22px",
        position: "relative",
        boxSizing: "border-box",
        border: "1.5px solid rgba(255,200,0,0.38)",
        background: "rgba(255,185,0,0.05)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        animation: ready
          ? "gos-card-in 0.7s cubic-bezier(0.34,1.56,0.64,1) 0.72s both"
          : "none",
      }}
    >
      {/* Gold corner accents */}
      {[
        { top: 12, left: 12, borderWidth: "2px 0 0 2px" },
        { top: 12, right: 12, borderWidth: "2px 2px 0 0" },
        { bottom: 12, left: 12, borderWidth: "0 0 2px 2px" },
        { bottom: 12, right: 12, borderWidth: "0 2px 2px 0" },
      ].map((c, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: 16,
            height: 16,
            zIndex: 5,
            border: `${c.borderWidth} solid rgba(255,185,0,0.72)`,
            ...c,
          }}
        />
      ))}

      {/* Background radial glow */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse at 50% 42%, rgba(255,210,0,0.11) 0%, transparent 70%)",
        }}
      />

      {/* Score label */}
      <p
        className="gos-pts-label"
        style={{
          fontFamily: "'Orbitron', monospace",
          fontSize: 10,
          letterSpacing: "0.3em",
          color: "rgba(255,210,80,0.6)",
          textTransform: "uppercase",
          margin: "0 0 18px",
          position: "relative",
          zIndex: 1,
        }}
      >
        Score
      </p>

      {/* Big coin — drops in, then bobs */}
      <div
        className="gos-coin-drop-anim"
        style={{
          width: 130,
          height: 130,
          position: "relative",
          zIndex: 1,
          marginBottom: 20,
        }}
      >
        <div
          className="gos-coin-bob-anim"
          style={{ width: "100%", height: "100%" }}
        >
          <CoinSVG />
        </div>
      </div>

      {/* Points number */}
      <span
        className="gos-points-num"
        style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 88,
          lineHeight: 1,
          color: "#FFD700",
          letterSpacing: "0.04em",
          position: "relative",
          zIndex: 1,
        }}
      >
        {points}
      </span>

      {/* pts earned label */}
      <span
        className="gos-pts-sublabel"
        style={{
          fontFamily: "'Rajdhani', sans-serif",
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: "0.22em",
          color: "rgba(255,200,80,0.5)",
          textTransform: "uppercase",
          marginTop: 6,
          position: "relative",
          zIndex: 1,
        }}
      >
        pts earned
      </span>

      {/* Decorative divider */}
      <div
        style={{
          width: "60%",
          height: 1,
          marginTop: 20,
          background:
            "linear-gradient(90deg, transparent, rgba(255,185,0,0.45), transparent)",
          position: "relative",
          zIndex: 1,
        }}
      />
    </div>
  );
}

// --- Inner screen -------------------------------------------------------------
function GameOverInner({ onPlayAgain }: { onPlayAgain?: () => void }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const dispatch = useDispatch();

  // -- Only source of truth: Redux -------------------------------------------
  const winner = useSelector((state: any) => state.gameOver.winner);

  useEffect(() => {
    injectStyles();
    const t = setTimeout(() => setReady(true), 50);
    return () => clearTimeout(t);
  }, []);

  const handlePlayAgain = () => {
    if (onPlayAgain) {
      onPlayAgain();
      dispatch(resetGameOver());
    } else {
      router.push("/");
      dispatch(resetGameOver());
    }
  };

  return (
    <div style={{ position: "relative" }}>
      {/* Scanline sweep */}
      <div
        style={{
          position: "absolute",
          left: 0,
          width: "100%",
          height: 180,
          background:
            "linear-gradient(transparent,rgba(255,255,255,0.024) 50%,transparent)",
          pointerEvents: "none",
          zIndex: 2,
          animation: "gos-scan 7s linear infinite",
        }}
      />

      {ready && <Confetti />}

      <div
        style={{
          position: "relative",
          marginTop: "20px",
          zIndex: 10,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px 16px 40px",
          boxSizing: "border-box",
        }}
      >
        {/* Crown */}
        <div
          style={{
            width: 110,
            height: 78,
            position: "relative",
            marginBottom: -6,
            animation: ready
              ? "gos-crown-drop 0.9s cubic-bezier(0.34,1.56,0.64,1) 0.08s both, gos-crown-float 3.5s ease-in-out 1s infinite"
              : "none",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: -22,
              background:
                "radial-gradient(circle,rgba(255,200,0,0.22) 0%,transparent 70%)",
              borderRadius: "50%",
              pointerEvents: "none",
            }}
          />
          <CrownSVG />
        </div>

        {/* Title */}
        <h1
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "clamp(52px, 11vw, 76px)",
            letterSpacing: "0.12em",
            background: "linear-gradient(180deg,#FFFFFF 0%,#BBBBBB 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            margin: "10px 0 4px",
            lineHeight: 1,
            animation: ready
              ? "gos-fade-down 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.22s both"
              : "none",
          }}
        >
          Game Over
        </h1>

        {/* Winner name — from Redux only */}
        <p
          style={{
            fontFamily: "'Orbitron', monospace",
            fontSize: "clamp(11px,2.4vw,15px)",
            fontWeight: 700,
            letterSpacing: "0.14em",
            color: "#4ADE80",
            marginBottom: 28,
            animation: ready
              ? "gos-fade-up 0.6s ease 0.42s both, gos-green-pulse 2s ease-in-out 1s infinite"
              : "none",
          }}
        >
          ✦ &nbsp;Winner: {winner?.name ?? "—"}&nbsp; ✦
        </p>

        {/* Cards — only render when Redux winner exists */}
        {winner && (
          <div
            style={{
              width: "100%",
              maxWidth: 820,
              display: "flex",
              flexDirection: "row",
              gap: 16,
              alignItems: "stretch",
              animation: ready ? "gos-fade-up 0.6s ease 0.6s both" : "none",
            }}
          >
            {/* Left — Winner card: name + avatar from Redux */}
            <WinnerCard
              name={winner.name}
              avatar={winner.avatar}
              ready={ready}
            />

            {/* Right — Points card: points from Redux */}
            <PointsCard points={winner.points ?? 0} ready={ready} />
          </div>
        )}

        {/* Play Again */}
        <button
          className="gos-btn-replay"
          onClick={handlePlayAgain}
          style={{
            marginTop: 28,
            fontFamily: "'Bebas Neue', sans-serif",
            letterSpacing: "0.22em",
            fontSize: 13,
            color: "rgba(255,255,255,0.75)",
            borderRadius: 10,
            padding: "10px 40px",
            cursor: "pointer",
            border: "1px solid rgba(255,255,255,0.15)",
            background: "transparent",
            transition:
              "background 0.2s ease, border-color 0.2s ease, transform 0.15s ease",
            animation: ready ? "gos-btn-appear 0.6s ease 0.85s both" : "none",
          }}
        >
          ↺ &nbsp;Play Again
        </button>
      </div>
    </div>
  );
}

// --- Main export --------------------------------------------------------------
export default function GameOverScreen({
  onPlayAgain,
}: {
  onPlayAgain?: () => void;
}) {
  return (
    <Suspense fallback={null}>
      <GameOverInner onPlayAgain={onPlayAgain} />
    </Suspense>
  );
}
