import { useState, useRef, useEffect } from "react";
import axios from "axios";
import MessageBubble from "./MessageBubble";
import ChatBox from "./ChatBox";
import { useUserContext } from "../../contexts/UserContext";

function ChatPage() {
  const { currentUser } = useUserContext();
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `Hi ${currentUser?.firstName}! 👋 I'm Prism — your ${currentUser?.examTarget} preparation assistant. Ask me anything from NCERT, PYQs, or formulas!`,
      sources: [],
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef(null);

  // auto scroll to bottom — like a real chat app
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(query) {
    // add user message immediately
    const userMsg = { role: "user", content: query, sources: [] };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    // Validate user data before sending
    if (!currentUser?.userId) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Error: User not authenticated. Please sign in again.", sources: [] },
      ]);
      setIsLoading(false);
      return;
    }

    try {
      const res = await axios.post("http://localhost:8000/api/chat", {
        query,
        userId: currentUser.userId,
        examTarget: currentUser.examTarget,
      });
      const assistantMsg = {
        role: "assistant",
        content: res.data.payload.answer,
        sources: res.data.payload.sources || [],
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (error) {
      console.error("Chat error:", error.response?.data || error.message);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Something went wrong. Please try again.", sources: [] },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="d-flex flex-column" style={{ height: "85vh" }}>
      {/* Chat header */}
      <div className="p-3 border-bottom bg-white d-flex align-items-center gap-2">
        <span className="fw-bold fs-5">🔷 Prism Chat</span>
        <span className="badge bg-dark">{currentUser?.examTarget}</span>
      </div>

      {/* Messages area */}
      <div className="flex-grow-1 overflow-auto p-4" style={{ background: "#f8f9fa" }}>
        {messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} />
        ))}
        {isLoading && (
          <div className="text-secondary small ms-2">Prism is thinking...</div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input box */}
      <ChatBox onSend={handleSend} isLoading={isLoading} />
    </div>
  );
}
export default ChatPage;