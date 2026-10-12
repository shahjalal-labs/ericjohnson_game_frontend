/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useSocket } from "@/hooks/useSocket";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import ParticipantPanel from "@/components/roundOne/Participantpanel";
import Cookies from "js-cookie";

interface Submission {
  imageUrl: string;
  userId: string;
}

interface ServerPlayer {
  id: string;
  isEliminated: boolean;
  isConnected: boolean;
  username?: string;
  name?: string;
  points?: number;
}

function shortId(userId: string): string {
  return `…${userId.slice(-6)}`;
}

export default function EliminationGame() {
  const router = useRouter();

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [eliminated, setEliminated] = useState<string[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null); // per-card loading
  const [loading, setLoading] = useState(false); // next round loading
  const token = Cookies.get("accessToken") || null;

  const nextRoundIndex = 2;
  const canNext = eliminated.length > 0;

  const reduxPlayers = useSelector(
    (state: RootState) => (state as any).participants?.players ?? [],
  ) as ServerPlayer[];

  const { sendEvent, isConnected } = useSocket({
    GAME_EVENT: (payload) => {
      console.log("🎮 Game Event received:", payload);
      if (payload.type === "DATA_UPDATE" && payload.payload?.allSubmissions) {
        setSubmissions(payload.payload.allSubmissions as Submission[]);
      }
    },
  });

  // -- Fires ELIMINATE socket event, marks player out on ACK ----------------
  const handleEliminate = (userId: string) => {
    setLoadingId(userId);
    sendEvent(
      "GAME_EVENT",
      {
        gameId: "internet-bachelor-123",
        type: "ELIMINATE",
        payload: { playerIds: [userId], points: 200 },
      },
      (response) => {
        console.log("✅ Eliminate ACK:", response);
        setLoadingId(null);
        // Mark eliminated locally after server confirms
        setEliminated((prev) =>
          prev.includes(userId) ? prev : [...prev, userId],
        );
      },
    );
  };

  // -- Undo: just remove from local list (no socket call needed) ------------
  const handleUndo = (userId: string) => {
    setEliminated((prev) => prev.filter((id) => id !== userId));
  };

  // -- Fires NEXT_ROUND socket event then navigates --------------------------
  const handleNextRound = () => {
    if (!canNext || loading) return;
    setLoading(true);
    sendEvent(
      "GAME_EVENT",
      {
        gameId: "internet-bachelor-123",
        type: "NEXT_ROUND",
        payload: { roundIndex: nextRoundIndex },
      },
      (response) => {
        console.log("✅ Next Round ACK:", response);
        setLoading(false);
        if (response.success) {
          router.push(`/round-two/round-two-four?x-token=${token}`);
        }
      },
    );
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-4 sm:px-6 py-3 border-b border-red-900/40 bg-black/40 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-xs sm:text-sm font-bold tracking-[0.2em] text-red-400 uppercase">
            Host Panel
          </span>
        </div>
        <span className="text-xs text-gray-500 tracking-widest uppercase">
          {isConnected() ? "🟢 Live" : "🔴 Offline"}
        </span>
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row gap-4 lg:gap-6 p-4 sm:p-6 max-w-7xl mx-auto">
        <div className="flex-1 min-w-0">
          {/* Round header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex items-center gap-3 mb-2">
              <div className="h-px w-8 sm:w-16 bg-gradient-to-r from-transparent to-red-600" />
              <span className="text-[10px] sm:text-xs text-red-500 tracking-[0.3em] uppercase font-bold">
                Round 2
              </span>
              <div className="h-px w-8 sm:w-16 bg-gradient-to-l from-transparent to-red-600" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white uppercase">
              Round 2 –{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">
                Pictures
              </span>
            </h1>
            <p className="mt-2 text-gray-500 text-xs sm:text-sm font-medium tracking-widest capitalize ">
              Eliminate Down to 2
              {/* {eliminated.length === 0
                ? "Select players to eliminate"
                : `${eliminated.length} player${eliminated.length !== 1 ? "s" : ""} eliminated`} */}
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Player grid */}
            <div className="flex-1">
              {submissions.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[280px] rounded-xl border border-white/10 bg-white/[0.02] gap-4">
                  <div className="w-8 h-8 border-2 border-red-500/40 border-t-red-500 rounded-full animate-spin" />
                  <p className="text-gray-500 text-sm tracking-widest uppercase">
                    Waiting for photo submissions…
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {submissions.map((submission, idx) => {
                    const isEliminated = eliminated.includes(submission.userId);
                    const isThisLoading = loadingId === submission.userId;

                    const reduxPlayer = reduxPlayers.find(
                      (p) => p.id === submission.userId,
                    );
                    const displayName =
                      reduxPlayer?.username ??
                      reduxPlayer?.name ??
                      `Player ${idx + 1}`;

                    return (
                      <div
                        key={submission.userId}
                        className={`relative rounded-xl overflow-hidden border transition-all duration-500 group
                          ${
                            isEliminated
                              ? "border-red-600/80 opacity-60 scale-[0.98]"
                              : "border-white/10 hover:border-red-500/40"
                          } bg-gradient-to-b from-white/5 to-black/60`}
                      >
                        {/* Player label */}
                        <div className="relative px-4 pt-3 pb-2 flex items-center justify-between">
                          <span className="text-xs sm:text-sm font-black tracking-[0.15em] text-gray-300 uppercase">
                            {displayName}
                          </span>
                          {isEliminated && (
                            <span className="text-[10px] font-bold tracking-widest text-red-500 uppercase bg-red-950/50 px-2 py-0.5 rounded-full border border-red-800/50">
                              Eliminated
                            </span>
                          )}
                        </div>

                        {/* Photo */}
                        <div className="relative mx-3 rounded-lg overflow-hidden aspect-[4/3]">
                          <img
                            src={submission.imageUrl}
                            alt={displayName}
                            className={`w-full h-full object-cover object-top transition-all duration-500 ${
                              isEliminated
                                ? "grayscale brightness-50"
                                : "group-hover:scale-105"
                            }`}
                          />
                          <div
                            className={`absolute inset-0 bg-gradient-to-b `}
                          />
                          {isEliminated && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="text-4xl sm:text-6xl font-black text-red-500/80 rotate-[-15deg] tracking-tighter uppercase border-4 border-red-500/50 px-4 py-2 rounded-lg">
                                OUT
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Eliminate / Undo button */}
                        <div className="px-3 py-3">
                          {isEliminated ? (
                            // Undo — local only, no socket
                            <button
                              onClick={() => handleUndo(submission.userId)}
                              className="w-full py-2.5 rounded-lg font-black text-xs sm:text-sm tracking-[0.2em] uppercase transition-all duration-300 active:scale-95 bg-red-950/60 text-red-400 border border-red-800/50 hover:bg-red-900/60"
                            >
                              <span className="flex items-center justify-center gap-2">
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                                  />
                                </svg>
                                Undo — {displayName}
                              </span>
                            </button>
                          ) : (
                            // Eliminate — fires ELIMINATE socket event
                            <button
                              onClick={() => handleEliminate(submission.userId)}
                              disabled={isThisLoading || loadingId !== null}
                              className="w-full py-2.5 rounded-lg font-black text-xs sm:text-sm tracking-[0.2em] uppercase transition-all duration-300 active:scale-95 bg-gradient-to-r from-red-900 to-red-800 hover:from-red-600 hover:to-red-500 text-white shadow-lg shadow-red-900/50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isThisLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                  <svg
                                    className="w-4 h-4 animate-spin"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                  >
                                    <circle
                                      className="opacity-25"
                                      cx="12"
                                      cy="12"
                                      r="10"
                                      stroke="currentColor"
                                      strokeWidth="4"
                                    />
                                    <path
                                      className="opacity-75"
                                      fill="currentColor"
                                      d="M4 12a8 8 0 018-8v8z"
                                    />
                                  </svg>
                                  Eliminating…
                                </span>
                              ) : (
                                `Eliminate ${displayName}`
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Next Round — appears as soon as any player is eliminated */}
              {canNext && (
                <div className="mt-6 sm:mt-8 flex justify-center">
                  <button
                    onClick={handleNextRound}
                    disabled={loading}
                    className="px-8 sm:px-12 py-3 sm:py-4 rounded-xl font-black text-sm sm:text-base tracking-[0.25em] uppercase transition-all duration-500 bg-gradient-to-r from-green-700 via-green-600 to-emerald-600 text-white shadow-xl shadow-green-900/60 hover:shadow-green-700/70 hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
                  >
                    {loading ? "Processing…" : "Next Round →"}
                  </button>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <ParticipantPanel />
          </div>
        </div>
      </div>
    </div>
  );
}
