
"use client";

import { useSocket } from "@/hooks/useSocket";
import {
  Participant,
  setPlayers,
} from "@/redux/features/sidePanel/participantsSlice";
import { useDispatch } from "react-redux";

interface ServerPlayer {
  id: string;
  socketId: string;
  name: string;
  avatar: string;
  points: number;
  isEliminated: boolean;
  isReady: boolean;
  isConnected: boolean;
  hasNetworkIssue: boolean;
  hasSubmitted: boolean;
}

function mapServerPlayers(players: ServerPlayer[]): Participant[] {
  return players.map((p) => ({
    id: p.id,
    name: p.name ?? `Player ${p.id.slice(-4)}`,
    avatar: p.avatar ?? "",

    isReady: p.isReady,
    isEliminated: p.isEliminated,
    isConnected: p.isConnected,
    points: p.points,
    hasNetworkIssue: p.hasNetworkIssue,
    hasSubmitted: p.hasSubmitted,
  }));
}

export function useSocketSync() {
  const dispatch = useDispatch();

  useSocket({
    GAME_EVENT: (payload) => {
      console.log("🎮 Game Event received:", payload);
      if (payload.type === "PLAYERS_UPDATE" && Array.isArray(payload.payload)) {
        dispatch(
          setPlayers(mapServerPlayers(payload.payload as ServerPlayer[])),
        );
      }
    },
  });
}
