"use client";

import { RootState } from "@/redux/store";
import { useSelector } from "react-redux";
import { useState } from "react";

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

function isUrl(str: string) {
  return str?.startsWith("http://") || str?.startsWith("https://");
}

function getInitials(name: string) {
  return (
    name
      ?.split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "?"
  );
}

function AvatarBubble({
  avatar,
  name,
  index,
  size = "sm",
  dimmed = false,
}: {
  avatar: string;
  name: string;
  index: number;
  size?: "sm" | "md" | "lg";
  dimmed?: boolean;
}) {
  const [imgError, setImgError] = useState(false);

  const sizeClasses = {
    sm: "w-9 h-9 text-xs",
    md: "w-11 h-11 text-sm",
    lg: "w-14 h-14 text-base",
  };

  const showImage = isUrl(avatar) && !imgError;
  const initials = isUrl(avatar) ? getInitials(name) : avatar;
  console.log(avatar);

  return (
    <div
      className={`
        ${sizeClasses[size]} rounded-full flex-shrink-0 relative overflow-hidden
        ${dimmed ? "opacity-40 grayscale" : ""}
        shadow-lg transition-all duration-300
      `}
    >
      {showImage ? (
        <img
          src={avatar}
          alt={name}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover rounded-full"
        />
      ) : (
        <div
          className={`
            w-full h-full rounded-full bg-gradient-to-br
            ${AVATAR_COLORS[index % AVATAR_COLORS.length]}
            flex items-center justify-center font-bold text-white
          `}
        >
          {initials}
        </div>
      )}
    </div>
  );
}

export default function ParticipantPanel() {
  const participants = useSelector(
    (state: RootState) => state.participants.players,
  );

  console.log("perticipants", participants);
  const readyCount = participants.filter((p) => p.isReady).length;

  return (
    <div className="lg:w-72 rounded-2xl border border-amber-500/30 bg-black/60 backdrop-blur-sm p-5">
      <h3 className="text-white/40 uppercase tracking-[0.25em] text-base font-bold mb-4">
        Participants{" "}
        <span className="text-amber-400/60 text-sm normal-case tracking-normal font-normal">
          {readyCount}/{participants.length} Ready
        </span>
      </h3>

      {participants.length === 0 ? (
        <p className="text-white/30 text-sm italic">Waiting for players…</p>
      ) : (
        <ul className="space-y-2">
          {participants.map((p, i) => (
            <li key={p.id} className="flex items-center gap-3 group">
              <div className="relative flex-shrink-0">
                <AvatarBubble
                  avatar={p.avatar}
                  name={p.name}
                  index={i}
                  size="sm"
                  dimmed={p.isEliminated}
                />
                {p.isConnected !== undefined && (
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-black ${
                      p.isConnected ? "bg-emerald-400" : "bg-red-500"
                    }`}
                  />
                )}
              </div>

              <span
                className={`flex-1 text-sm font-medium truncate transition-colors ${
                  p.isEliminated
                    ? "text-white/30 line-through"
                    : "text-white/80 group-hover:text-white"
                }`}
              >
                {p.name}
              </span>

              {p.isEliminated ? (
                <span className="text-red-400/70 text-[12px] font-extrabold uppercase tracking-widest">
                  Out
                </span>
              ) : p.isReady ? (
                <span className="text-green-400 text-[12px] font-extrabold uppercase tracking-widest">
                  Ready
                </span>
              ) : (
                <span className="text-white/40 text-[12px] uppercase tracking-widest">
                  Waiting
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
