// src/contexts/ChatContext.jsx
// manages all chat state globally
// sessions list, active session, messages, loading state

import { createContext, useContext, useState, useCallback } from "react";
import {
  createSession,
  getUserSessions,
  getSession,
  deleteSession,
  sendMessage,
} from "../services/api";

const ChatContext = createContext();

export function useChatContext() {
  return useContext(ChatContext);
}

export function ChatProvider({ children }) {
  const [sessions, setSessions] = useState([]);         // sidebar list
  const [activeSession, setActiveSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [abortController, setAbortController] = useState(null);

  // load all sessions for sidebar
  const loadSessions = useCallback(async (userId) => {
    try {
      const res = await getUserSessions(userId);
      setSessions(res.data.payload || []);
    } catch (err) {
      console.error("[ChatContext] Failed to load sessions:", err);
    }
  }, []);

  // load a specific session and its messages
  const loadSession = useCallback(async (userId, sessionId) => {
    try {
      const res = await getSession(userId, sessionId);
      const session = res.data.payload;
      if (session) {
        setActiveSession(session);
        setMessages(session.messages || []);
      }
    } catch (err) {
      console.error("[ChatContext] Failed to load session:", err);
    }
  }, []);

  // start a new session
  const startNewSession = useCallback(async (userId, examTarget, firstMessage) => {
    try {
      const res = await createSession({ userId, examTarget, firstMessage });
      const session = res.data.payload;
      setActiveSession(session);
      setMessages([]);
      setSessions((prev) => [session, ...prev]);
      return session;
    } catch (err) {
      console.error("[ChatContext] Failed to create session:", err);
      return null;
    }
  }, []);

  // send a message
  const sendChat = useCallback(async (query, userId, examTarget) => {
    if (!query.trim()) return;

    // add user message to UI immediately
    const userMsg = {
      role: "user",
      content: query,
      sources: [],
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    // create abort controller for stop button
    const controller = new AbortController();
    setAbortController(controller);

    try {
      let sessionId = activeSession?.sessionId;

      // create new session if none exists
      if (!sessionId) {
        const newSession = await startNewSession(userId, examTarget, query);
        sessionId = newSession?.sessionId;
      }

      const res = await sendMessage(
        { query, userId, examTarget, sessionId },
        controller.signal
      );

      const assistantMsg = {
        role: "assistant",
        content: res.data.payload.answer,
        sources: res.data.payload.sources || [],
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // refresh sessions list (updated title/timestamp)
      await loadSessions(userId);

    } catch (err) {
      if (err.name === "CanceledError" || err.code === "ERR_CANCELED") {
        // user stopped the response — add stopped message
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Response stopped.",
            sources: [],
            timestamp: new Date().toISOString(),
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Something went wrong. Please try again.",
            sources: [],
            timestamp: new Date().toISOString(),
          },
        ]);
      }
    } finally {
      setIsLoading(false);
      setAbortController(null);
    }
  }, [activeSession, startNewSession, loadSessions]);

  // stop current response
  const stopResponse = useCallback(() => {
    if (abortController) {
      abortController.abort();
      console.log("[ChatContext] Response aborted by user.");
    }
  }, [abortController]);

  // delete a session
  const removeSession = useCallback(async (userId, sessionId) => {
    await deleteSession(userId, sessionId);
    setSessions((prev) => prev.filter((s) => s.sessionId !== sessionId));
    if (activeSession?.sessionId === sessionId) {
      setActiveSession(null);
      setMessages([]);
    }
  }, [activeSession]);

  return (
    <ChatContext.Provider value={{
      sessions,
      activeSession,
      messages,
      isLoading,
      setMessages,
      loadSessions,
      loadSession,
      startNewSession,
      sendChat,
      stopResponse,
      removeSession,
      setActiveSession,
    }}>
      {children}
    </ChatContext.Provider>
  );
}