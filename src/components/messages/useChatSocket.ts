"use client";

import Cookies from "js-cookie";
import { useCallback, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";

interface Message {
  id: string;
  text: string;
  timestamp: string;
  isSent: boolean;
  senderId?: string;
  createdAt?: string;
  content?: string;
  fileUrls?: string[];
  roomId?: string;
  user1Id?: string;
  user2Id?: string;
}

interface Contact {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  online?: boolean;
  selected?: boolean;
  roomId?: string;
  unreadCount?: number;
  partner?: any;
}

interface UseChatSocketProps {
  userId: string;
}

const SOCKET_URL = "wss://api.internetbachelor.com";

export function useChatSocket({ userId }: UseChatSocketProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<
    "disconnected" | "connecting" | "connected" | "error"
  >("disconnected");
  const [isConnecting, setIsConnecting] = useState(false);
  const token = Cookies.get("accessToken");

  const socketRef = useRef<Socket | null>(null);
  const selectedContactRef = useRef<Contact | null>(null);
  const hasAutoSelectedRef = useRef(false);

  // Scroll helper
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Keep selectedContactRef synced
  useEffect(() => {
    selectedContactRef.current = selectedContact;
  }, [selectedContact]);

  // Connect Socket.IO
  useEffect(() => {
    if (!token) {
      console.warn("⚠️ No token provided for Socket.IO connection");
      return;
    }

    setIsConnecting(true);
    setConnectionStatus("connecting");

    const socket: Socket = io(SOCKET_URL, {
      auth: { token },
      query: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("✅ Socket.IO connected:", socket.id);
      setIsConnecting(false);
      setConnectionStatus("connected");

      // Request conversations list on connect
      socket.emit("conversation", { type: "conversation" });
      socket.emit("message", { type: "conversation" });
    });

    const handleIncomingData = (eventType: string, data: any) => {
      if (!data) return;

      let payload = data;
      if (typeof data === "string") {
        try {
          payload = JSON.parse(data);
        } catch {
          payload = { content: data };
        }
      }

      const type = payload.type || eventType;

      // Handle conversations list
      if (type === "conversation" || payload.conversations) {
        const rawConvs = payload.conversations || (Array.isArray(payload) ? payload : []);
        const formattedContacts: Contact[] = rawConvs
          .filter((conv: any) => conv.partner?.id)
          .map((conv: any) => ({
            id: conv.partner.id,
            name: conv.partner.fullName || "Unknown",
            avatar: conv.partner.profileImage || "/placeholder.svg",
            lastMessage: conv.lastMessage?.content || "No messages yet",
            time: conv.lastMessage?.createdAt
              ? new Date(conv.lastMessage.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "Just now",
            online: conv.partner.isActive,
            roomId: conv.roomId,
            unreadCount: conv.unreadCount || 0,
            partner: conv.partner,
          }));

        setContacts(formattedContacts);

        if (
          formattedContacts.length > 0 &&
          !selectedContactRef.current &&
          !hasAutoSelectedRef.current
        ) {
          const firstContact = formattedContacts[0];
          setSelectedContact(firstContact);
          selectedContactRef.current = firstContact;
          hasAutoSelectedRef.current = true;

          // Subscribe to first contact
          if (socket.connected) {
            socket.emit("subscribe", {
              type: "subscribe",
              receiverId: firstContact.id,
            });
            socket.emit("message", {
              type: "subscribe",
              receiverId: firstContact.id,
            });
          }
        }
        return;
      }

      // Handle past messages
      if (type === "past-messages" || (payload.messages && Array.isArray(payload.messages))) {
        console.log(
          "📦 Past messages received:",
          payload.messages?.length,
          "messages",
        );

        const pastMessages: Message[] = (payload.messages || []).map(
          (msg: any, index: number) => {
            const senderId = String(
              msg.senderId ||
                msg.user1Id ||
                msg.sender?.id ||
                msg.from ||
                "",
            );
            const user1Id = String(msg.user1Id || "");
            const normalizedUserId = String(userId || "");

            const isSent =
              senderId === normalizedUserId ||
              user1Id === normalizedUserId ||
              msg.sender?.id === normalizedUserId;

            return {
              id: `${msg.roomId || "room"}-${msg.id || msg._id || index}`,
              text: msg.content || "",
              timestamp: msg.createdAt
                ? new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Just now",
              isSent,
              senderId,
              createdAt: msg.createdAt,
              content: msg.content,
              fileUrls: msg.fileUrl || msg.fileUrls || [],
              roomId: msg.roomId,
              user1Id: msg.user1Id,
              user2Id: msg.user2Id,
            };
          },
        );

        setMessages(pastMessages.reverse());
        setTimeout(
          () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }),
          50,
        );
        return;
      }

      // Handle real-time single message
      if (
        type === "message" ||
        type === "send-message" ||
        type === "new-message" ||
        payload.content ||
        payload.senderId
      ) {
        const msgData = payload.data || payload.message || payload;
        if (!msgData.content && !msgData.fileUrl && !msgData.fileUrls) return;

        const msgId = msgData.id || msgData._id || Date.now();
        const uniqueId = `${msgData.roomId || "room"}-${msgId}`;

        const senderId = String(
          msgData.senderId || msgData.user1Id || msgData.sender?.id || "",
        );
        const normalizedUserId = String(userId || "");
        const isSent =
          senderId === normalizedUserId ||
          String(msgData.user1Id) === normalizedUserId;

        console.log("📨 New real-time message:", {
          senderId,
          normalizedUserId,
          isSent,
          content: msgData.content?.substring(0, 20),
        });

        const newMessage: Message = {
          id: uniqueId,
          text: msgData.content || "",
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          isSent,
          senderId,
          createdAt: msgData.createdAt || new Date().toISOString(),
          content: msgData.content,
          fileUrls: msgData.fileUrl || msgData.fileUrls || [],
          roomId: msgData.roomId,
          user1Id: msgData.user1Id,
          user2Id: msgData.user2Id,
        };

        setMessages((prev) => {
          const isDuplicate = prev.some(
            (msg) =>
              msg.id === newMessage.id ||
              (msg.content === newMessage.content &&
                msg.isSent === newMessage.isSent &&
                Math.abs(
                  new Date(msg.createdAt || msg.timestamp).getTime() -
                    Date.now(),
                ) < 5000),
          );

          if (isDuplicate) return prev;
          return [...prev, newMessage];
        });

        setTimeout(
          () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }),
          100,
        );
      }
    };

    // Wildcard listener catches all socket.io events
    socket.onAny((event, ...args) => {
      console.log(`💬 Socket event received [${event}]:`, args[0]);
      handleIncomingData(event, args[0]);
    });

    socket.on("connect_error", (err) => {
      console.error("🔴 Socket.IO connection error:", err);
      setIsConnecting(false);
      setConnectionStatus("error");
    });

    socket.on("disconnect", (reason) => {
      console.log("❌ Socket.IO disconnected:", reason);
      setIsConnecting(false);
      setConnectionStatus("disconnected");
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token, userId]);

  // Subscribe to selected contact
  const subscribeContact = useCallback((contact: Contact) => {
    setSelectedContact(contact);
    selectedContactRef.current = contact;
    setMessages([]);

    if (socketRef.current?.connected) {
      const payload = { type: "subscribe", receiverId: contact.id };
      socketRef.current.emit("subscribe", payload);
      socketRef.current.emit("message", payload);
    }

    setContacts((prev) =>
      prev.map((c) =>
        c.id === contact.id
          ? { ...c, selected: true, unreadCount: 0 }
          : { ...c, selected: false },
      ),
    );
  }, []);

  // Send message function
  const sendMessage = useCallback(
    (content: string, fileUrls: string[] = []) => {
      if (!socketRef.current || !socketRef.current.connected) {
        toast.error("Connection lost. Please wait...");
        return false;
      }

      if (!selectedContactRef.current) {
        toast.error("No contact selected");
        return false;
      }

      if (!content.trim() && fileUrls.length === 0) {
        toast.error("Message cannot be empty");
        return false;
      }

      const activeContact = selectedContactRef.current;

      // Create optimistic message
      const optimisticMessage: Message = {
        id: `temp-${Date.now()}-${Math.random()}`,
        text: content.trim(),
        content: content.trim(),
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isSent: true,
        senderId: userId,
        createdAt: new Date().toISOString(),
        fileUrls: fileUrls,
        roomId: activeContact.roomId,
        user1Id: userId,
        user2Id: activeContact.id,
      };

      setMessages((prev) => [...prev, optimisticMessage]);
      setTimeout(
        () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }),
        50,
      );

      const messageData = {
        type: "send-message",
        receiverId: activeContact.id,
        content: content.trim(),
        fileUrl: fileUrls,
      };

      socketRef.current.emit("send-message", messageData);
      socketRef.current.emit("message", messageData);
      return true;
    },
    [userId],
  );

  return {
    contacts,
    selectedContact,
    messages,
    connectionStatus,
    isConnecting,
    subscribeContact,
    sendMessage,
    setMessages,
    socketRef,
    webSocketRef: socketRef,
    messagesEndRef,
  };
}

