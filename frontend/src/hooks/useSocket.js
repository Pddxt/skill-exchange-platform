import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useAuth } from "../context/AuthContext.jsx";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

export const useSocket = (onReceiveMessage) => {
  const { user } = useAuth();
  const socketRef = useRef(null);

  useEffect(() => {
    if (!user) return undefined;

    const socket = io(SOCKET_URL);
    socketRef.current = socket;
    socket.emit("join", user._id);

    if (onReceiveMessage) {
      socket.on("receiveMessage", onReceiveMessage);
    }

    return () => {
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id]);

  return socketRef;
};
