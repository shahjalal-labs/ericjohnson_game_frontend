/* eslint-disable react-hooks/refs */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import Cookies from "js-cookie";
import { useSearchParams } from "next/navigation";
import { sanitizeToken } from "@/lib/jwt";

// const SOCKET_URL = "http://164.92.85.75:5040";
// const SOCKET_URL = "wss://api.internetbachelor.com";
const SOCKET_URL = "wss://api.internetbachelor.com";

let globalSocket: Socket | null = null;

export const useSocket = (events?: Record<string, (payload: any) => void>) => {
  const searchParams = useSearchParams();
  const token =
    sanitizeToken(searchParams.get("x-token"));

    // ??
    //sanitizeToken(Cookies.get("accessToken"))

    console.log("🔑 Token for socket connection:", token);
    console.log("🌐 url token:", token);

  const eventsRef = useRef(events);
  eventsRef.current = events;

  useEffect(() => {
    if (!token) return;

    if (!globalSocket || !globalSocket.connected) {
      globalSocket = io(SOCKET_URL, {
        auth: { token },
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
      });

      globalSocket.on("connect", () => {
        console.log("✅ Socket Connected:", globalSocket?.id);
      });

      globalSocket.on("disconnect", (reason) => {
        console.log("❌ Disconnected:", reason);
        if (reason === "io server disconnect") {
          globalSocket?.connect();
        }
      });

      globalSocket.on("connect_error", (err) => {
        console.error("🔴 Connection Error:", err);
      });

      globalSocket.on("reconnect_attempt", (attempt) => {
        console.log(`🔄 Reconnecting... attempt ${attempt}`);
      });

      globalSocket.on("reconnect", () => {
        console.log("✅ Reconnected!");
      });
    }

    const currentEvents = eventsRef.current;
    if (currentEvents) {
      Object.entries(currentEvents).forEach(([event, handler]) => {
        globalSocket?.on(event, handler);
      });
    }

    return () => {
      const currentEvents = eventsRef.current;
      if (currentEvents) {
        Object.entries(currentEvents).forEach(([event, handler]) => {
          globalSocket?.off(event, handler);
        });
      }
    };
  }, [token]);

  const sendEvent = useCallback(
    (type: string, payload?: any, ack?: (res: any) => void) => {
      if (!globalSocket?.connected) {
        console.warn("⚠️ Socket not connected");
        return;
      }
      console.log("📤 Sending:", type, payload);
      if (ack) {
        globalSocket.emit(type, payload, ack);
      } else {
        globalSocket.emit(type, payload);
      }
    },
    [],
  );

  const isConnected = useCallback(() => {
    return globalSocket?.connected ?? false;
  }, []);

  return { sendEvent, isConnected, socket: globalSocket };
};
