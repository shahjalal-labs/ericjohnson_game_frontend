"use client";

import Button from "@/components/share/ButtonPrimary";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  Sparkles,
  Crown,
  Phone,
  Image as ImageIcon,
  Wifi,
  WifiOff,
  MessageSquare,
  Camera,
  Video,
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { useSocket } from "@/hooks/useSocket";
import VideoCallRound from "./Videocallround";
import { GameWinner, setGameOver } from "@/redux/features/winner/Gameoverslice";
import { useFileUploadingMutation } from "@/redux/api/getMe/getMeApi";
import SnapEditor from "@/components/snapEdit/Snapedit";
import Cookies from "js-cookie";

/* --- Types ---------------------------------------------------------------- */
interface ServerPlayer {
  id: string;
  socketId?: string;
  name?: string;
  username?: string;
  avatar?: string;
  ready?: boolean;
  isReady?: boolean;
  isEliminated?: boolean;
  isConnected?: boolean;
  isElement?: boolean;
}

type LocalPhase =
  | "LOBBY"
  | "READY_WAITING"
  | "QUESTION"
  | "ANSWER_WAITING"
  | "IMAGE_UPLOAD"
  | "IMAGE_WAITING"
  | "VIDEO"
  | "ELEMENT"
  | "ELIMINATED";

/* --- Round Title Banner --------------------------------------------------- */
function RoundTitle({
  roundNumber,
  roundName,
  icon,
  accentColor = "amber",
}: {
  roundNumber: string;
  roundName: string;
  icon: React.ReactNode;
  accentColor?: "amber" | "rose" | "emerald" | "sky" | "violet";
}) {
  const colors: Record<
    string,
    { label: string; name: string; border: string; glow: string; icon: string }
  > = {
    amber: {
      label: "text-amber-500/80",
      name: "text-amber-300",
      border: "border-amber-500/20",
      glow: "from-amber-500/10",
      icon: "text-amber-400",
    },
    sky: {
      label: "text-sky-500/80",
      name: "text-sky-300",
      border: "border-sky-500/20",
      glow: "from-sky-500/10",
      icon: "text-sky-400",
    },
    violet: {
      label: "text-violet-400/80",
      name: "text-violet-200",
      border: "border-violet-500/20",
      glow: "from-violet-500/10",
      icon: "text-violet-400",
    },
    rose: {
      label: "text-rose-500/80",
      name: "text-rose-300",
      border: "border-rose-500/20",
      glow: "from-rose-500/10",
      icon: "text-rose-400",
    },
    emerald: {
      label: "text-emerald-500/80",
      name: "text-emerald-300",
      border: "border-emerald-500/20",
      glow: "from-emerald-500/10",
      icon: "text-emerald-400",
    },
  };

  const c = colors[accentColor];

  return (
    <div
      className={`w-full flex items-center gap-4 pb-3  mb-2 border-b ${c.border}`}
    >
      <div
        className={`flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br ${c.glow} to-transparent border ${c.border} ${c.icon} shrink-0`}
      >
        {icon}
      </div>
      <div className="flex flex-col leading-tight">
        <span
          className={`text-[13px]  font-mono uppercase tracking-[5px] ${c.label}`}
        >
          {roundNumber}
        </span>
        <span
          className={`text-xl sm:text-2xl font-black uppercase tracking-widest ${c.name}`}
        >
          {roundName}
        </span>
      </div>
    </div>
  );
}

/* --- Animated dot row ----------------------------------------------------- */
function PulseDots({ count = 3 }: { count?: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce"
          style={{ animationDelay: `${i * 150}ms` }}
        />
      ))}
    </div>
  );
}

/* --- Waiting card --------------------------------------------------------- */
function WaitingCard({
  icon,
  title,
  subtitle,
  accentColor = "amber",
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  accentColor?: "amber" | "rose" | "emerald" | "sky";
}) {
  const ring: Record<string, string> = {
    amber: "ring-amber-500/30 text-amber-400",
    rose: "ring-rose-500/30 text-rose-400",
    emerald: "ring-emerald-500/30 text-emerald-400",
    sky: "ring-sky-500/30 text-sky-400",
  };
  const glow: Record<string, string> = {
    amber: "from-amber-500/10",
    rose: "from-rose-500/10",
    emerald: "from-emerald-500/10",
    sky: "from-sky-500/10",
  };
  return (
    <div className="flex flex-col items-center gap-6 py-4 w-full max-w-sm mx-auto">
      <div
        className={`relative w-20 h-20 rounded-full ring-2 ${ring[accentColor]} flex items-center justify-center bg-gradient-to-br ${glow[accentColor]} to-transparent`}
      >
        <span className={ring[accentColor]}>{icon}</span>
        <span
          className={`absolute w-2.5 h-2.5 rounded-full bg-current ${ring[accentColor].split(" ")[1]} animate-spin`}
          style={{
            top: "-5px",
            left: "calc(50% - 5px)",
            transformOrigin: "5px 45px",
            animationDuration: "2.4s",
          }}
        />
      </div>
      <div className="text-center space-y-2">
        <p className="text-white font-bold text-xl tracking-widest uppercase font-mono">
          {title}
        </p>
        <p className="text-white/40 text-sm tracking-wide">{subtitle}</p>
      </div>
      <PulseDots count={5} />
    </div>
  );
}

/* --- Element spectator screen --------------------------------------------- */
function ElementSpectator({ username }: { username?: string }) {
  return (
    <div className="relative flex flex-col items-center gap-8 py-6 w-full overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-rose-500/5" />
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-amber-400/5 blur-3xl animate-pulse"
          style={{ animationDuration: "3s" }}
        />
      </div>
      <div className="relative flex items-center justify-center">
        {[0, 60, 120, 180, 240, 300].map((deg) => (
          <span
            key={deg}
            className="absolute text-amber-300/60"
            style={{
              fontSize: "10px",
              transform: `rotate(${deg}deg) translateY(-52px)`,
            }}
          >
            ✦
          </span>
        ))}
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-400/20 to-rose-500/20 ring-2 ring-amber-400/40 flex items-center justify-center">
          <Crown className="w-12 h-12 text-amber-300" strokeWidth={1.5} />
        </div>
      </div>
      <div className="text-center space-y-3 z-10">
        <p className="text-[10px] text-amber-500/60 uppercase tracking-[6px] font-mono">
          Tournament Status
        </p>
        <h2
          className="text-4xl sm:text-5xl font-black uppercase tracking-widest leading-none"
          style={{
            background:
              "linear-gradient(135deg, #fbbf24 0%, #f9a8d4 50%, #fbbf24 100%)",
            backgroundSize: "200% 200%",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            animation: "shimmer 4s linear infinite",
          }}
        >
          You Are an
          <br />
          Element
        </h2>
        <p className="text-white/50 text-sm tracking-widest uppercase">
          One of the Seven ✦ {username ? `@${username}` : ""}
        </p>
      </div>
      <div className="flex items-center gap-3 px-6 py-3 rounded-full border border-amber-500/20 bg-amber-500/5 z-10">
        <Sparkles
          className="w-4 h-4 text-amber-400 animate-spin"
          style={{ animationDuration: "3s" }}
        />
        <span className="text-amber-300 text-sm font-medium tracking-widest uppercase font-mono">
          Watching the tournament
        </span>
        <Sparkles
          className="w-4 h-4 text-amber-400 animate-spin"
          style={{ animationDuration: "3s", animationDirection: "reverse" }}
        />
      </div>
      <div className="flex items-center gap-2 z-10">
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full"
            style={{
              background: `hsl(${40 + i * 10}, 90%, 60%)`,
              animation: "ping 1.4s cubic-bezier(0,0,0.2,1) infinite",
              animationDelay: `${i * 100}ms`,
            }}
          />
        ))}
      </div>
      <style>{`
        @keyframes shimmer { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
        @keyframes ping { 75%,100%{transform:scale(2);opacity:0} }
      `}</style>
    </div>
  );
}

/* --- Eliminated screen ---------------------------------------------------- */
function EliminatedScreen() {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center gap-6 py-8 w-full">
      <div className="w-20 h-20 rounded-full border-2 border-rose-500/40 flex items-center justify-center bg-rose-500/10">
        <span className="text-4xl">💔</span>
      </div>
      <div className="text-center space-y-2">
        <p className="text-rose-400 font-black text-3xl uppercase tracking-widest font-mono">
          Eliminated
        </p>
        <p className="text-white/30 text-sm tracking-wide">
          Your journey ends here. Thank you for playing.
        </p>
      </div>
      <button
        onClick={() => router.push("/")}
        className="mt-2 px-8 py-3 rounded-full border border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/20 hover:border-rose-400/60 text-rose-300 hover:text-rose-200 text-sm font-semibold uppercase tracking-widest font-mono transition-all duration-300 active:scale-95"
      >
        Please Try Again
      </button>
    </div>
  );
}

/* --- Lobby screen --------------------------------------------------------- */
function LobbyScreen({
  charIdx,
  lobbyText,
  onReady,
}: {
  charIdx: number;
  lobbyText: string;
  onReady: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-8 w-full z-10">
      <div className="text-center">
        <p className="text-[10px] text-amber-500/50 uppercase tracking-[6px] font-mono mb-4">
          Tournament Hub
        </p>
        <p className="text-white font-bold text-lg sm:text-2xl italic leading-relaxed min-h-[3.5rem] font-mono">
          {lobbyText.slice(0, charIdx)}
          {charIdx < lobbyText.length && (
            <span className="inline-block w-0.5 h-6 bg-amber-400 align-middle animate-pulse ml-0.5" />
          )}
        </p>
      </div>
      <div className="flex flex-col items-center gap-3">
        <p className="text-white/30 text-xs uppercase tracking-widest">
          Waiting for the host to begin
        </p>
        <Button variant="game" onClick={onReady}>
          I&apos;m Ready
        </Button>
      </div>
    </div>
  );
}

/* --- Waiting screens ------------------------------------------------------ */
function ReadyWaitingScreen() {
  return (
    <div className="w-full flex flex-col items-center gap-6">
      <RoundTitle
        roundNumber="Round 1"
        roundName="Questions"
        icon={<MessageSquare className="w-5 h-5" />}
        accentColor="emerald"
      />
      <WaitingCard
        icon={<Check className="w-9 h-9" />}
        title="Ready!"
        subtitle="Waiting for the host to send the first question…"
        accentColor="emerald"
      />
    </div>
  );
}

function AnswerWaitingScreen() {
  return (
    <div className="w-full flex flex-col items-center gap-6">
      <RoundTitle
        roundNumber="Round 1"
        roundName="Questions"
        icon={<MessageSquare className="w-5 h-5" />}
        accentColor="amber"
      />
      <WaitingCard
        icon={<ImageIcon className="w-9 h-9" />}
        title="Answer Submitted"
        subtitle="Preparing the image upload round…"
        accentColor="amber"
      />
    </div>
  );
}

function ImageWaitingScreen() {
  return (
    <div className="w-full flex flex-col items-center gap-6">
      <RoundTitle
        roundNumber="Round 2"
        roundName="Pictures"
        icon={<Camera className="w-5 h-5" />}
        accentColor="sky"
      />
      <WaitingCard
        icon={<Phone className="w-9 h-9" />}
        title="Image Received"
        subtitle="Waiting for the host to call you…"
        accentColor="sky"
      />
    </div>
  );
}

/* --- Player avatar -------------------------------------------------------- */
function Avatar({ player, index }: { player: ServerPlayer; index: number }) {
  const isEl = player.isElement === true;
  const isElim = player.isEliminated;
  return (
    <div
      title={player.username ?? player.name ?? `Player ${index + 1}`}
      className={`relative w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-500 ${
        isEl
          ? "bg-gradient-to-br from-amber-400 to-rose-500 border-amber-300 text-black scale-110 shadow-2xl shadow-amber-500/50"
          : isElim
            ? "bg-rose-950/40 border-rose-800/40 text-rose-800 opacity-40 scale-90"
            : player.isReady || player.ready
              ? "bg-emerald-900/40 border-emerald-500/50 text-emerald-300"
              : "bg-amber-500/10 border-amber-500/30 text-amber-400/60"
      }`}
    >
      {index + 1}
      {isEl && (
        <span
          className="absolute -top-1 -right-1 text-sm leading-none animate-spin"
          style={{ animationDuration: "6s" }}
        >
          ✦
        </span>
      )}
      {isElim && (
        <span className="absolute -bottom-1 -right-1 text-xs leading-none">
          💔
        </span>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   Main Component
══════════════════════════════════════════════════════════════════════════════ */
const GAME_ID = "internet-bachelor-123";
const LOBBY_TEXT = '"CONNECTED TO LOBBY"';

function QuesationShowAndAns() {
  const router = useRouter();
  const dispatch = useDispatch();

  /* -- State ------------------------------------------------------------- */
  const [charIdx, setCharIdx] = useState(0);
  const [localPhase, setLocalPhase] = useState<LocalPhase>("LOBBY");
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);
  const [answer, setAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showElementAnimation, setShowElementAnimation] = useState(false);
  const [previousElementStatus, setPreviousElementStatus] = useState(false);
  const [incomingHostId, setIncomingHostId] = useState<string | null>(null);
  const [callKey, setCallKey] = useState(0);
  const [callEndedKey, setCallEndedKey] = useState(0);

  const token = Cookies.get("accessToken") || null;

  /* -- Redux ------------------------------------------------------------- */
  const currentUser = useSelector((state: any) => state.user.user);
  const participants: ServerPlayer[] = useSelector(
    (state: any) => state.participants?.players ?? [],
  );

  const currentPlayer = participants.find((p) => p.id === currentUser?.id);
  const isElement = currentPlayer?.isElement === true;
  const isEliminated = currentPlayer?.isEliminated === true;

  /* -- Refs -------------------------------------------------------------- */
  const isEliminatedRef = useRef(false);
  useEffect(() => {
    isEliminatedRef.current = isEliminated;
  }, [isEliminated]);

  /* -- File upload mutation ---------------------------------------------- */
  const [
    uploadFile,
    {
      isLoading: isImageUploading,
      isError: isImageUploadError,
      error: imageUploadErrorData,
      data: imageUploadData,
    },
  ] = useFileUploadingMutation();

  /* -- Extract Image URL Helper ------------------------------------------ */
  const extractImageUrl = (response: any): string => {
    // Check if response.result is an array with at least one item
    if (response?.result && Array.isArray(response.result) && response.result.length > 0) {
      const url = response.result[0];
      if (typeof url === 'string' && url.startsWith('http')) {
        return url;
      }
    }
    
    // Fallback for other possible response structures
    if (typeof response?.data === "string" && response.data.startsWith("http")) {
      return response.data;
    }
    
    return (
      response?.url ?? 
      response?.imageUrl ?? 
      response?.data?.url ?? 
      response?.path ?? 
      ""
    );
  };

  /* -- Socket ------------------------------------------------------------ */
  const { sendEvent, isConnected } = useSocket({
    GAME_EVENT: (payload: any) => {
      console.log("🎮 Game Event received:", payload);

      if (payload.type === "GAME_ENDED") {
        const { winner, noWinner } = payload.payload ?? {};
        handleGameEnded(winner ?? null, noWinner === true);
        return;
      }

      if (isEliminatedRef.current && payload.type !== "PLAYERS_UPDATE") return;

      if (payload.type === "PLAYERS_UPDATE" && Array.isArray(payload.payload)) {
        const newParticipants = payload.payload as ServerPlayer[];

        const isNowElement = newParticipants.some(
          (p) => p.id === currentUser?.id && p.isElement === true,
        );
        if (isNowElement && !previousElementStatus) {
          setShowElementAnimation(true);
          safeSetPhase("ELEMENT");
          setTimeout(() => setShowElementAnimation(false), 4200);
        }
        setPreviousElementStatus(isNowElement);

        const nowEliminated = newParticipants.some(
          (p) => p.id === currentUser?.id && p.isEliminated === true,
        );
        if (nowEliminated) {
          isEliminatedRef.current = true;
          setLocalPhase("ELIMINATED");
        }
      }

      if (payload.type === "NEW_QUESTION") {
        setCurrentQuestion(payload.payload.question);
        setAnswer("");
        safeSetPhase("QUESTION");
      }

      if (payload.type === "ROUND_STARTED") {
        setIncomingHostId(null);
        setCallKey(0);
        setCallEndedKey(0);
        if (payload.payload.type === "IMAGE") safeSetPhase("IMAGE_UPLOAD");
        if (payload.payload.type === "VIDEO") safeSetPhase("VIDEO");
      }

      if (payload.type === "INCOMING_CALL") {
        setIncomingHostId(payload.payload.hostId);
        setCallKey((p) => p + 1);
        safeSetPhase("VIDEO");
      }

      if (payload.type === "CALL_ENDED") {
        setIncomingHostId(null);
        setCallEndedKey((p) => p + 1);
      }
    },

    ROSE_GIVEN: (payload: any) =>
      console.log("🌹 Rose given to:", payload.player),

    PLAYER_ELIMINATED: (payload: any) => {
      if (
        payload.player?.id === currentUser?.id ||
        payload.playerId === currentUser?.id
      ) {
        isEliminatedRef.current = true;
        setLocalPhase("ELIMINATED");
      }
    },

    GAME_ENDED: (payload: any) => {
      const winner: GameWinner | null =
        payload?.winner ?? payload?.payload?.winner ?? null;
      const noWinner: boolean =
        payload?.noWinner ?? payload?.payload?.noWinner ?? false;
      handleGameEnded(winner, noWinner);
    },
  });

  /* -- Helpers ----------------------------------------------------------- */
  const safeSetPhase = useCallback((phase: LocalPhase) => {
    if (isEliminatedRef.current && phase !== "ELIMINATED") return;
    setLocalPhase(phase);
  }, []);

  const handleGameEnded = useCallback(
    (winner: GameWinner | null, noWinner?: boolean) => {
      if (noWinner || !winner) {
        router.push("/no-winner");
        return;
      }
      dispatch(setGameOver(winner));
      router.push(`/round-two/round-two-six?x-token=${token}`);
    },
    [dispatch, router],
  );

  /* -- Image submit ------------------------------------------------------ */
  const handleImageSubmit = useCallback(
    async (blob: Blob) => {
      try {
        const formData = new FormData();
        formData.append("files", blob, `snap-${Date.now()}.png`);

        const result = await uploadFile(formData).unwrap();
        console.log("API Response:", result);
        
        // Extract URL from the response
        const imageUrl = extractImageUrl(result);
        console.log("Image URL:", imageUrl);

        if (!imageUrl) {
          console.error("No URL found in response:", result);
          throw new Error("No URL returned from upload API");
        }
        
        sendEvent(
          "GAME_EVENT",
          {
            gameId: GAME_ID,
            type: "SUBMIT_DATA",
            payload: { data: { imageUrl: imageUrl } },
          },
          (response: any) => {
            if (response?.success === true) {
              safeSetPhase("IMAGE_WAITING");
            }
          },
        );
      } catch (err) {
        console.error("Image upload failed:", err);
      }
    },
    [uploadFile, safeSetPhase, sendEvent],
  );

  /* -- Effects ----------------------------------------------------------- */
  useEffect(() => {
    if (localPhase !== "LOBBY") return;
    if (charIdx >= LOBBY_TEXT.length) return;
    const t = setTimeout(() => setCharIdx((c) => c + 1), 40);
    return () => clearTimeout(t);
  }, [charIdx, localPhase]);

  useEffect(() => {
    if (isEliminated) {
      isEliminatedRef.current = true;
      setLocalPhase("ELIMINATED");
    } else if (
      isElement &&
      localPhase !== "ELEMENT" &&
      localPhase !== "VIDEO"
    ) {
      safeSetPhase("ELEMENT");
    }
  }, [isElement, isEliminated, localPhase, safeSetPhase]);

  /* -- Action handlers --------------------------------------------------- */
  const handleReady = () => {
    sendEvent(
      "GAME_EVENT",
      { gameId: GAME_ID, type: "PLAYER_READY", payload: {} },
      (response: any) => {
        if (response?.ready === true || response?.success === true) {
          safeSetPhase("READY_WAITING");
        }
      },
    );
  };

  const handleSubmitAnswer = () => {
    if (!answer.trim() || submitting) return;
    setSubmitting(true);
    sendEvent(
      "GAME_EVENT",
      {
        gameId: GAME_ID,
        type: "SUBMIT_DATA",
        payload: { data: { answer: answer.trim() } },
      },
      (response: any) => {
        setSubmitting(false);
        if (response?.success === true) {
          safeSetPhase("ANSWER_WAITING");
          setCurrentQuestion(null);
        }
      },
    );
  };

  /* -- Derive SnapEditor props ------------------------------------------- */
  const snapUploadErrorMsg: string | null = isImageUploadError
    ? ((imageUploadErrorData as any)?.data?.message ??
      (imageUploadErrorData as any)?.message ??
      "Upload failed")
    : null;

  const snapUploadedUrl: string | null = imageUploadData
    ? extractImageUrl(imageUploadData)
    : null;

  /* -- Phase renderer ---------------------------------------------------- */
  const renderCenter = () => {
    switch (localPhase) {
      case "ELIMINATED":
        return <EliminatedScreen />;

      case "ELEMENT":
        return (
          <ElementSpectator
            username={currentPlayer?.username ?? currentPlayer?.name}
          />
        );

      case "VIDEO":
        return (
          <div className="w-full flex flex-col gap-6">
            {/* -- Round 3 — The Grand Finale title -- */}
            <RoundTitle
              roundNumber="Round 3"
              roundName="The Grand Finale"
              icon={<Video className="w-5 h-5" />}
              accentColor="violet"
            />
            <VideoCallRound
              sendEvent={sendEvent}
              incomingHostId={incomingHostId}
              callKey={callKey}
              callEndedKey={callEndedKey}
              gameId={GAME_ID}
            />
          </div>
        );

      case "IMAGE_UPLOAD":
        return (
          <div className="w-full flex flex-col gap-6">
            {/* -- Round 2 — Pictures title -- */}
            <RoundTitle
              roundNumber="Round 2"
              roundName="Pictures"
              icon={<Camera className="w-5 h-5" />}
              accentColor="sky"
            />
            <SnapEditor
              onSubmit={handleImageSubmit}
              isUploading={isImageUploading}
              uploadError={snapUploadErrorMsg}
              uploadedUrl={snapUploadedUrl}
            />
          </div>
        );

      case "IMAGE_WAITING":
        return <ImageWaitingScreen />;

      case "ANSWER_WAITING":
        return <AnswerWaitingScreen />;

      case "READY_WAITING":
        return <ReadyWaitingScreen />;

      case "QUESTION":
        if (!currentQuestion) return null;
        return (
          <div className="w-full flex flex-col items-center gap-6 z-10">
            {/* -- Round 1 — Questions title -- */}
            <RoundTitle
              roundNumber="Round 1"
              roundName="Questions"
              icon={<MessageSquare className="w-5 h-5" />}
              accentColor="amber"
            />

            {/* Question card */}
            <div className="w-full max-w-2xl rounded-2xl border border-amber-500/20 bg-black/30 p-6">
              <p className="text-[10px] text-amber-500/50 uppercase tracking-[5px] font-mono mb-3">
                Question
              </p>
              <p className="text-white font-semibold text-lg sm:text-xl leading-relaxed">
                {currentQuestion}
              </p>
            </div>

            {/* Answer textarea */}
            <div className="w-full max-w-2xl flex flex-col gap-3">
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value.slice(0, 300))}
                placeholder="Write your answer here…"
                rows={5}
                className="w-full bg-black/40 border border-amber-500/20 hover:border-amber-500/40 focus:border-amber-400/60 rounded-2xl resize-none p-4 text-sm sm:text-base text-zinc-200 placeholder:text-zinc-600 focus:outline-none transition-colors leading-relaxed"
                style={{ fontFamily: "'Georgia', serif" }}
              />
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-mono ${
                    answer.length > 280 ? "text-rose-400" : "text-zinc-600"
                  }`}
                >
                  {answer.length} / 300
                </span>
                <Button
                  variant="game"
                  onClick={handleSubmitAnswer}
                  disabled={submitting || !answer.trim()}
                >
                  {submitting ? "Submitting…" : "Submit Answer"}
                </Button>
              </div>
            </div>
          </div>
        );

      case "LOBBY":
      default:
        return (
          <LobbyScreen
            charIdx={charIdx}
            lobbyText={LOBBY_TEXT}
            onReady={handleReady}
          />
        );
    }
  };

  /* -- Phase label map --------------------------------------------------- */
  const phaseLabel: Record<LocalPhase, string> = {
    LOBBY: "Lobby",
    READY_WAITING: "Ready — awaiting question",
    QUESTION: "Round 1 · Questions",
    ANSWER_WAITING: "Answer sent — awaiting image round",
    IMAGE_UPLOAD: "Round 2 · Pictures",
    IMAGE_WAITING: "Image sent — awaiting call",
    VIDEO: "Round 3 · The Grand Finale",
    ELEMENT: "You are an Element",
    ELIMINATED: "Eliminated",
  };

  const connected = isConnected();
  const activeCount = participants.filter((p) => !p.isEliminated).length;

  /* -- Render ------------------------------------------------------------ */
  return (
    <div className="w-full max-w-7xl mx-auto px-4 flex flex-col gap-6">
      {/* -- Status bar -- */}
      <div className="flex items-center gap-3">
        <span
          className={`flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest transition-colors ${
            connected ? "text-emerald-400" : "text-rose-400"
          }`}
        >
          {connected ? <Wifi size={12} /> : <WifiOff size={12} />}
          {connected ? "Connected" : "Disconnected"}
        </span>
        <span className="text-white/10">·</span>
        <span className="text-white/30 text-xs font-mono uppercase tracking-widest">
          {phaseLabel[localPhase]}
        </span>
      </div>

      {/* -- Main card -- */}
      <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-black/90 via-zinc-950/80 to-rose-950/30 backdrop-blur-sm p-8 sm:p-10 flex flex-col items-center gap-8 min-h-[420px] justify-center relative overflow-hidden">
        {/* Decorative background radials */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, #d97706 0%, transparent 50%), radial-gradient(circle at 80% 80%, #9f1239 0%, transparent 50%)",
          }}
        />

        {/* Element flash animation */}
        {showElementAnimation && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl">
            <ElementSpectator
              username={currentPlayer?.username ?? currentPlayer?.name}
            />
          </div>
        )}

        {renderCenter()}
      </div>

      {/* -- Player avatars -- */}
      <div className="text-center">
        <p className="text-white/20 text-[10px] uppercase tracking-widest mb-4 font-mono">
          Contestants — {activeCount} active
        </p>
        <div className="flex items-center justify-center flex-wrap gap-3">
          {participants.map((p, i) => (
            <Avatar key={p.id} player={p} index={i} />
          ))}
        </div>

        {isElement && (
          <p className="mt-5 text-amber-400/80 text-sm font-medium tracking-wide flex items-center justify-center gap-2">
            <Sparkles size={14} /> You are one of the Seven Elements{" "}
            <Sparkles size={14} />
          </p>
        )}
      </div>
    </div>
  );
}

export default QuesationShowAndAns;