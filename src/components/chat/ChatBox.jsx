// components/chat/ChatBox.jsx
// chat input area
// features: send on Enter, stop response button,
// disabled while loading

import { useState } from "react";

function ChatBox({ onSend, onStop, isLoading }) {
  const [input, setInput] = useState("");

  function handleSend() {
    if (!input.trim() || isLoading) return;
    onSend(input.trim());
    setInput("");
  }

  function handleKeyDown(e) {
    // send on Enter, new line on Shift+Enter
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div
      className="d-flex gap-2 p-3 border-top bg-white align-items-end"
      style={{ flexShrink: 0 }}
    >
      <textarea
        className="form-control"
        rows={2}
        placeholder="Ask anything — formulas, PYQs, concepts..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={isLoading}
        style={{
          resize: "none",
          borderRadius: "12px",
          fontSize: "0.95rem"
        }}
      />

      {/* stop button — shown while loading */}
      {isLoading ? (
        <button
          className="btn btn-danger px-3"
          onClick={onStop}
          title="Stop response"
          style={{ borderRadius: "12px", flexShrink: 0 }}
        >
          ⏹ Stop
        </button>
      ) : (
        <button
          className="btn btn-dark px-3"
          onClick={handleSend}
          disabled={!input.trim()}
          style={{ borderRadius: "12px", flexShrink: 0 }}
        >
          Send ↵
        </button>
      )}
    </div>
  );
}

export default ChatBox;