"use client";

import ParticipantPanel from "@/components/roundOne/Participantpanel";
import { useSocket } from "@/hooks/useSocket";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import Button from "@/components/share/ButtonPrimary";

import { GameWinner, setGameOver } from "@/redux/features/winner/Gameoverslice";
import { VideoCallModal } from "./HostVideoCall";
import Cookies from "js-cookie";

// --- ZegoCloud Credentials ----------------------------------------------------
const ZEGO_APP_ID = 1697884864;
const ZEGO_SERVER_SECRET = "9ad294853be97ac5458a620f1b2c85a1";

// --- Types --------------------------------------------------------------------
interface Player {
  id: string;
  name?: string;
  avatar?: string;
  socketId: string;
  isEliminated: boolean;
  isReady: boolean;
  isConnected: boolean;
  hasNetworkIssue: boolean;
  hasSubmitted: boolean;
  points: number;
}

const AVATAR_POOL = [
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&h=900&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=900&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&h=900&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&h=900&fit=crop&crop=face",
];
const BG_COLORS = ["#1a6abf", "#2a2a2a", "#6b1a1a", "#1a5c2a"];
const GAME_ID = "internet-bachelor-123";
const ELIMINATE_POINTS = 100;

// --- DeclareNeitherScreen -----------------------------------------------------
function DeclareNeitherScreen() {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [showSubtitle, setShowSubtitle] = useState(false);
  const [showBody, setShowBody] = useState(false);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 100);
    const t2 = setTimeout(() => setShowSubtitle(true), 700);
    const t3 = setTimeout(() => setShowBody(true), 1200);
    const t4 = setTimeout(() => setShowButton(true), 1800);
    return () => [t1, t2, t3, t4].forEach(clearTimeout);
  }, []);

  return (
    <div
      className={`
        fixed inset-0 z-50 flex items-center justify-center
        bg-black/95 backdrop-blur-sm
        transition-opacity duration-700
        ${visible ? "opacity-100" : "opacity-0"}
      `}
    >
      {/* Background grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 40%, rgba(220,38,38,0.06) 0%, transparent 65%),
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)
          `,
          backgroundSize: "100% 100%, 48px 48px, 48px 48px",
        }}
      />

      {/* Corner marks */}
      <span className="absolute top-6 left-6 text-neutral-800 text-xs font-mono tracking-widest select-none">
        ◻ SESSION END
      </span>
      <span className="absolute top-6 right-6 text-neutral-800 text-xs font-mono tracking-widest select-none">
        NO WINNER ◻
      </span>
      <span className="absolute bottom-6 left-6 text-neutral-800 text-xs font-mono tracking-widest select-none">
        ROUND CONCLUDED
      </span>
      <span className="absolute bottom-6 right-6 text-neutral-800 text-xs font-mono tracking-widest select-none">
        HOST DECISION ◻
      </span>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-lg mx-4 text-center flex flex-col items-center">
        {/* Icon */}
        <div
          className={`mb-8 transition-all duration-700 ${visible ? "scale-100 opacity-100" : "scale-75 opacity-0"}`}
        >
          <div
            className="relative w-28 h-28 rounded-full flex items-center justify-center mx-auto"
            style={{
              border: "1px solid rgba(220,38,38,0.25)",
              boxShadow:
                "0 0 48px rgba(220,38,38,0.08), inset 0 0 24px rgba(0,0,0,0.4)",
            }}
          >
            <div
              className="absolute inset-2 rounded-full"
              style={{ border: "1px solid rgba(220,38,38,0.15)" }}
            />
            <span className="text-5xl relative z-10 select-none">🚫</span>
          </div>
        </div>

        {/* Headline */}
        <h1
          className={`text-4xl sm:text-5xl font-black tracking-[0.12em] uppercase text-white transition-all duration-700 delay-100 ${visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}
        >
          No Winner
        </h1>

        {/* Divider */}
        <div
          className={`flex items-center gap-3 my-5 transition-all duration-700 ${visible ? "opacity-100" : "opacity-0"}`}
        >
          <div className="h-px w-20 bg-gradient-to-r from-transparent to-red-700/60" />
          <div className="w-1 h-1 rounded-full bg-red-600" />
          <span className="text-red-500 text-[10px] font-black tracking-[0.4em] uppercase">
            Declared
          </span>
          <div className="w-1 h-1 rounded-full bg-red-600" />
          <div className="h-px w-20 bg-gradient-to-l from-transparent to-red-700/60" />
        </div>

        {/* Subtitle */}
        <p
          className={`text-neutral-400 text-sm tracking-[0.25em] uppercase font-semibold mb-8 transition-all duration-700 ${showSubtitle ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
        >
          The Host has ended this round
        </p>

        {/* Body card */}
        <div
          className={`w-full rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 mb-8 transition-all duration-700 ${showBody ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}
        >
          <p className="text-neutral-300 text-sm leading-relaxed mb-4">
            After careful consideration, the host has decided that{" "}
            <span className="text-white font-bold">no contestant</span> will be
            declared the winner of this round.
          </p>
          <p className="text-neutral-500 text-xs leading-relaxed">
            This decision is final. No points have been awarded, and no
            elimination has taken place. The round has been closed without a
            declared winner.
          </p>

          <div className="my-5 h-px bg-white/[0.08]" />

          <div className="flex items-center justify-center gap-8 text-center">
            <div>
              <p className="text-[10px] text-neutral-600 uppercase tracking-widest font-mono mb-1">
                Winner
              </p>
              <p className="text-sm font-black text-red-500 tracking-widest uppercase">
                None
              </p>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div>
              <p className="text-[10px] text-neutral-600 uppercase tracking-widest font-mono mb-1">
                Points Awarded
              </p>
              <p className="text-sm font-black text-neutral-400 tracking-widest">
                0
              </p>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div>
              <p className="text-[10px] text-neutral-600 uppercase tracking-widest font-mono mb-1">
                Status
              </p>
              <p className="text-sm font-black text-orange-500 tracking-widest uppercase">
                Closed
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div
          className={`w-full transition-all duration-700 ${showButton ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
        >
          <button
            onClick={() => router.push("/")}
            className="w-full py-4 rounded-xl border border-white/15 text-xs font-black tracking-[0.3em] uppercase text-white/80 hover:bg-white/5 hover:border-white/25 hover:text-white transition-all duration-300 cursor-pointer"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

// --- PlayerCard ---------------------------------------------------------------
function PlayerCard({
  player,
  index,
  onCall,
  onEliminate,
  isEliminating,
  isCallDisabled,
}: {
  player: Player;
  index: number;
  onCall: (p: Player, i: number) => void;
  onEliminate: (p: Player) => void;
  isEliminating: boolean;
  isCallDisabled: boolean;
}) {
  const name = player.name ?? `Player ${index + 1}`;
  const isEliminated = player.isEliminated;

  return (
    <>
      <div
        className={`relative flex flex-col rounded-2xl overflow-hidden border transition-all duration-500 ${
          isEliminated
            ? "border-red-900/60 opacity-50 grayscale"
            : "border-white/10 bg-gradient-to-b from-neutral-900/90 to-black/95 hover:border-orange-500/40 hover:shadow-[0_0_24px_rgba(249,115,22,0.15)]"
        }`}
      >
        {/* Status badges */}
        <div className="absolute top-3 right-3 flex flex-col gap-1 z-10">
          <span
            className={`text-[9px] font-black tracking-widest px-2 py-0.5 rounded-full ${
              player.isConnected
                ? "bg-green-500/20 text-green-400 border border-green-500/40"
                : "bg-red-500/20 text-red-400 border border-red-500/40"
            }`}
          >
            {player.isConnected ? "● ONLINE" : "● OFFLINE"}
          </span>
          {player.hasNetworkIssue && (
            <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/40">
              ⚠ NET
            </span>
          )}
        </div>

        {/* Name + ID */}
        <div className="text-center pt-4 pb-2 px-4">
          <p className="text-white font-black text-sm tracking-widest uppercase truncate">
            {name}
          </p>
          <p className="text-white/35 text-[9px] tracking-[0.3em] uppercase font-mono mt-1">
            ID
          </p>
          <p className="text-white/50 font-mono text-[10px] break-all mt-0.5">
            {player.id}
          </p>
        </div>

        {/* Avatar */}
        <div className="relative w-full aspect-square overflow-hidden px-4">
          <img
            src={player.avatar}
            alt={name}
            className="w-full h-full object-cover object-top rounded-xl transition-transform duration-700 hover:scale-105"
            style={{ backgroundColor: BG_COLORS[index % BG_COLORS.length] }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none rounded-xl" />
          <div className="absolute bottom-3 left-7 bg-black/70 border border-white/10 rounded-lg px-2 py-1">
            <span className="text-yellow-400 text-xs font-black">
              ⭐ {player.points}
            </span>
          </div>
        </div>

        {/* Buttons */}
        <div className="p-4 flex flex-col gap-2">
          {/* Video Call */}
          <button
            onClick={() => onCall(player, index)}
            disabled={isEliminated || isEliminating || isCallDisabled}
            title={
              isCallDisabled ? "Call already ended for this player" : undefined
            }
            className={`w-full py-3 rounded-xl text-xs font-black tracking-[0.2em] uppercase transition-all duration-300 text-white flex items-center justify-center gap-2
            ${
              isCallDisabled
                ? "bg-neutral-700/50 border border-neutral-600/40 cursor-not-allowed opacity-50"
                : "bg-green-700 hover:bg-green-800 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            }
          `}
          >
            {isCallDisabled ? (
              <>
                <span>🔇</span> Call Ended
              </>
            ) : (
              <>
                <span>🎥</span> Video Call
              </>
            )}
          </button>

          {/* Eliminate */}
          <Button
            variant="game"
            onClick={() => onEliminate(player)}
            disabled={isEliminating || isEliminated}
            className="w-full flex items-center justify-center gap-2"
          >
            {isEliminated ? (
              <>
                <span>💀</span> Eliminated
              </>
            ) : isEliminating ? (
              <>
                <span className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin inline-block" />{" "}
                Eliminating…
              </>
            ) : (
              <>
                <span>⚡</span> Eliminate Player
              </>
            )}
          </Button>
        </div>
      </div>
      {/* -- Declare Neither ----------------------------------------------- */}
    </>
  );
}

// --- Main Component -----------------------------------------------------------
export default function GrandFinale() {
  const [activeCall, setActiveCall] = useState<{
    player: Player;
    index: number;
  } | null>(null);
  const [acceptedUserId, setAcceptedUserId] = useState<string | null>(null);
  const [rejectedUserId, setRejectedUserId] = useState<string | null>(null);
  const [endedCallIds, setEndedCallIds] = useState<Set<string>>(new Set());
  const [eliminatingId, setEliminatingId] = useState<string | null>(null);

  // -- DECLARE NEITHER state -------------------------------------------------
  const [isDeclaring, setIsDeclaring] = useState(false);
  const [showNeitherScreen, setShowNeitherScreen] = useState(false);
  const [declareError, setDeclareError] = useState<string | null>(null);

  const router = useRouter();
  const dispatch = useDispatch();

  const currentUser = useSelector((state: any) => state.user.user);
  const participants = useSelector((state: any) => state.participants.players);
  const isGameOver = useSelector((state: any) => state.gameOver.isGameOver);

  const activePlayers = participants.filter((p: Player) => !p.isEliminated);

  const token = Cookies.get("token");

  useEffect(() => {
    if (isGameOver) {
      router.push(`/round-two/round-two-six?x-token=${token}`);
    }
  }, [isGameOver]);

  // -- Socket events ---------------------------------------------------------
  const { isConnected, sendEvent } = useSocket({
    GAME_EVENT: (payload: any) => {
      console.log("🎮 GAME_EVENT received (host):", payload);

      if (payload?.type === "CALL_ACCEPTED") {
        setAcceptedUserId(payload?.payload?.userId);
      }
      if (payload?.type === "CALL_REJECTED") {
        setRejectedUserId(payload?.payload?.userId);
      }
      if (payload?.type === "GAME_ENDED" && payload?.payload?.winner) {
        const winner: GameWinner = payload.payload.winner;
        dispatch(setGameOver(winner));
      }
    },
  });

  const callAccepted = !!activeCall && acceptedUserId === activeCall.player.id;
  const callRejected =
    !!activeCall && rejectedUserId === activeCall.player.id && !callAccepted;

  // -- Close call ------------------------------------------------------------
  const handleCloseCall = useCallback(() => {
    if (activeCall) {
      setEndedCallIds((prev) => new Set(prev).add(activeCall.player.id));
    }
    setActiveCall(null);
    setAcceptedUserId(null);
    setRejectedUserId(null);
  }, [activeCall]);

  // -- Eliminate -------------------------------------------------------------
  const handleEliminate = useCallback(
    (player: Player) => {
      if (eliminatingId) return;
      setEliminatingId(player.id);

      sendEvent(
        "GAME_EVENT",
        {
          gameId: GAME_ID,
          type: "ELIMINATE",
          payload: {
            playerIds: [player.id],
            points: ELIMINATE_POINTS,
            winnerPoints: 400,
          },
        },
        (response: any) => {
          if (response?.success) {
            if (response?.winner) {
              dispatch(setGameOver(response.winner as GameWinner));
            } else {
              setEliminatingId(null);
            }
          } else {
            console.warn("❌ Eliminate failed:", response);
            setEliminatingId(null);
          }
        },
      );
    },
    [sendEvent, dispatch, eliminatingId],
  );

  // -- Declare Neither -------------------------------------------------------
  const handleDeclareNeither = useCallback(() => {
    if (isDeclaring) return;
    setIsDeclaring(true);
    setDeclareError(null);

    sendEvent(
      "GAME_EVENT",
      {
        gameId: GAME_ID,
        type: "DECLARE_NEITHER",
        payload: {},
      },
      (response: any) => {
        console.log("🚫 DECLARE_NEITHER ACK:", response);
        if (response?.success) {
          router.push("/no-winner");
        } else {
          console.warn("❌ Declare Neither failed:", response);
          setDeclareError("Failed to declare. Please try again.");
          setIsDeclaring(false);
        }
      },
    );
  }, [sendEvent, isDeclaring, router]);

  return (
    <div className="w-full max-w-7xl mx-auto relative overflow-hidden font-sans">
      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-4 sm:px-8 py-4 border-b border-red-900/30">
        <span className="text-white/80 text-sm font-semibold tracking-widest uppercase">
          {isConnected() ? "🟢 Live" : "🔴 Offline"} Host Panel
        </span>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-red-400 text-xs font-bold tracking-widest uppercase">
            Live
          </span>
        </div>
      </div>

      <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Title */}
        <div className="text-center mb-10 space-y-2">
          <h1 className="text-3xl sm:text-4xl font-black tracking-[0.15em] uppercase text-white drop-shadow-[0_0_30px_rgba(220,38,38,0.4)]">
            The Grand Finale
          </h1>
          <p className="text-red-500 text-sm font-black tracking-[0.4em]  capitalize animate-pulse">
            Pick Final Winner
          </p>
          <div className="flex items-center justify-center gap-4 pt-2">
            <div className="h-px w-32 bg-gradient-to-r from-transparent to-red-700" />
            <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
            <div className="h-px w-32 bg-gradient-to-l from-transparent to-red-700" />
          </div>
        </div>

        <div className="text-center mb-6">
          <span className="text-neutral-400 text-xs tracking-widest uppercase">
            Active Players:{" "}
            <span className="text-white font-black">
              {activePlayers.length}
            </span>
          </span>
        </div>

        {/* Declare error toast */}
        {declareError && (
          <div className="mb-4 mx-auto max-w-sm text-center bg-red-900/30 border border-red-700/40 rounded-xl px-4 py-2">
            <p className="text-red-400 text-xs font-bold tracking-widest uppercase">
              {declareError}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_320px] gap-4 lg:gap-6">
          <div className="lg:col-span-2 space-y-4">
            {activePlayers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="text-5xl mb-4 opacity-30">👥</div>
                <p className="text-neutral-500 text-sm tracking-widest uppercase">
                  Waiting for players…
                </p>
              </div>
            ) : (
              <>
                <div
                  className={`grid gap-4 ${
                    activePlayers.length === 1
                      ? "grid-cols-1 max-w-xs mx-auto"
                      : activePlayers.length === 2
                        ? "grid-cols-2"
                        : activePlayers.length === 3
                          ? "grid-cols-3"
                          : "grid-cols-2"
                  }`}
                >
                  {activePlayers.map((player: Player, index: number) => (
                    <PlayerCard
                      key={player.id}
                      player={player}
                      index={index}
                      onCall={(p, i) => setActiveCall({ player: p, index: i })}
                      onEliminate={handleEliminate}
                      isEliminating={eliminatingId === player.id}
                      isCallDisabled={endedCallIds.has(player.id)}
                    />
                  ))}
                </div>
                <div className="flex justify-center items-center mt-5">
                  <button
                    onClick={handleDeclareNeither}
                    disabled={isDeclaring}
                    className={`
              w-full py-3 rounded-xl text-xs font-black tracking-[0.2em] uppercase
              transition-all duration-300 flex items-center justify-center gap-2
              border
              ${
                isDeclaring
                  ? "bg-neutral-800/60 border-neutral-700/40 text-neutral-500 cursor-not-allowed opacity-60"
                  : "bg-transparent border-orange-500/50 text-orange-400 hover:bg-orange-500/10 hover:border-orange-400 hover:text-orange-300 hover:shadow-[0_0_16px_rgba(249,115,22,0.2)] cursor-pointer"
              }
            `}
                  >
                    {isDeclaring ? (
                      <>
                        <span className="w-3 h-3 rounded-full border-2 border-orange-400 border-t-transparent animate-spin inline-block" />{" "}
                        Declaring…
                      </>
                    ) : (
                      <>
                        <span>🚫</span> Declare Neither
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>

          <ParticipantPanel />
        </div>
      </div>

      {/* Video Call Modal */}
      {activeCall && (
        <VideoCallModal
          player={activeCall.player}
          index={activeCall.index}
          onClose={handleCloseCall}
          sendEvent={sendEvent}
          callAccepted={callAccepted}
          callRejected={callRejected}
          hostUserId={currentUser?.id ?? ""}
          hostUserName={currentUser?.name ?? currentUser?.username ?? "Host"}
        />
      )}

      {/* Declare Neither Screen */}
      {showNeitherScreen && <DeclareNeitherScreen />}
    </div>
  );
}
