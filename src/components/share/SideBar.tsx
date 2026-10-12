import React, { useState } from "react";
interface Participant {
  id: number;
  name: string;
  avatar: string;
  status: "READY" | "WAITING" | "OFFLINE";
  color: string;
  image: string;
}
const PARTICIPANTS: Participant[] = [
  {
    id: 1,
    name: "Savan Nguyen",
    avatar: "SN",
    status: "READY",
    color: "#f97316",
    image: "https://i.pravatar.cc/150?img=11",
  },
  {
    id: 2,
    name: "Darrell Steward",
    avatar: "DS",
    status: "READY",
    color: "#60a5fa",
    image: "https://i.pravatar.cc/150?img=12",
  },
  {
    id: 3,
    name: "Jane Cooper",
    avatar: "JC",
    status: "READY",
    color: "#34d399",
    image: "https://i.pravatar.cc/150?img=5",
  },
  {
    id: 4,
    name: "Esther Howard",
    avatar: "EH",
    status: "READY",
    color: "#a78bfa",
    image: "https://i.pravatar.cc/150?img=9",
  },
  {
    id: 5,
    name: "Jerome Bell",
    avatar: "JB",
    status: "READY",
    color: "#fbbf24",
    image: "https://i.pravatar.cc/150?img=15",
  },
  {
    id: 6,
    name: "Annette Black",
    avatar: "AB",
    status: "WAITING",
    color: "#f472b6",
    image: "https://i.pravatar.cc/150?img=20",
  },
  {
    id: 7,
    name: "Ronald Richards",
    avatar: "RR",
    status: "READY",
    color: "#22d3ee",
    image: "https://i.pravatar.cc/150?img=33",
  },
  {
    id: 8,
    name: "Eleanor Pena",
    avatar: "EP",
    status: "OFFLINE",
    color: "#86efac",
    image: "https://i.pravatar.cc/150?img=47",
  },
];

function StatusBadge({ status }: { status: Participant["status"] }) {
  const cfg = {
    READY: {
      cls: "text-emerald-400",
      dot: "bg-emerald-400 animate-pulse",
      label: "READY",
    },
    WAITING: { cls: "text-amber-400", dot: "bg-amber-400", label: "WAITING" },
    OFFLINE: { cls: "text-zinc-500", dot: "bg-zinc-600", label: "OFFLINE" },
  }[status];
  return (
    <span
      className={`flex items-center gap-1.5 text-[10px] font-bold tracking-widest ${cfg.cls}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}
function ParticipantRow({ p, index }: { p: Participant; index: number }) {
  const [imgErr, setImgErr] = useState(false);
  return (
    <div
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 hover:bg-white/5 group cursor-default"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div
        className="relative flex-shrink-0 w-9 h-9 rounded-full overflow-hidden ring-2 ring-white/10 group-hover:ring-white/25 transition-all"
        style={{ boxShadow: `0 0 10px ${p.color}40` }}
      >
        {!imgErr ? (
          <img
            src={p.image}
            alt={p.name}
            className="w-full h-full object-cover"
            onError={() => setImgErr(true)}
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-white text-[11px] font-black"
            style={{
              background: `radial-gradient(circle at 35% 35%, ${p.color}cc, ${p.color}55)`,
            }}
          >
            {p.avatar}
          </div>
        )}
        {p.status === "READY" && (
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-[#100808]" />
        )}
      </div>
      <span className="flex-1 text-[13px] font-semibold text-zinc-300 group-hover:text-white transition-colors truncate tracking-wide">
        {p.name}
      </span>
      <StatusBadge status={p.status} />
    </div>
  );
}

const SideBar = () => {
  const readyCount = PARTICIPANTS.filter((p) => p.status === "READY").length;
  return (
    <aside
      className="sm:col-span-2 lg:col-span-1 rounded-2xl overflow-hidden flex flex-col"
      style={{
        background: "linear-gradient(160deg, #1c0c06 0%, #130806 100%)",
        border: "1.5px solid rgba(180,60,20,0.3)",
        boxShadow: "0 0 40px rgba(180,60,20,0.1)",
      }}
    >
      <div className="h-px bg-gradient-to-r from-transparent via-orange-700/50 to-transparent" />
      <div className="px-4 sm:px-5 pt-5 pb-3 flex items-center justify-between">
        <h2
          className="text-base font-black tracking-[0.2em] uppercase text-zinc-100"
          style={{ fontFamily: "'Georgia', serif" }}
        >
          Participants
        </h2>
        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2.5 py-1 rounded-full">
          {readyCount} Ready
        </span>
      </div>
      <div className="mx-4 sm:mx-5 h-px bg-white/5 mb-1" />
      <div className="px-2 sm:px-3 pb-4 flex flex-col overflow-y-auto flex-1">
        {PARTICIPANTS.map((p, i) => (
          <ParticipantRow key={p.id} p={p} index={i} />
        ))}
      </div>
      <div className="h-px bg-gradient-to-r from-transparent via-orange-800/40 to-transparent" />
    </aside>
  );
};

export default SideBar;
