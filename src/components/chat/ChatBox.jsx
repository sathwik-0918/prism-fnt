import { useState } from "react";

function ChatBox({ onSend, isLoading }) {
  const [input, setInput] = useState("");

  function handleSend() {
    if (!input.trim()) return;
    onSend(input);
    setInput("");
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="d-flex gap-2 p-3 border-top bg-white">
      <textarea
        className="form-control"
        rows={2}
        placeholder="Ask anything from NCERT, PYQs, formulas..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={isLoading}
        style={{ resize: "none", borderRadius: "12px" }}
      />
      <button
        className="btn btn-dark px-4"
        onClick={handleSend}
        disabled={isLoading || !input.trim()}
        style={{ borderRadius: "12px" }}
      >
        {isLoading ? "..." : "Send"}
      </button>
    </div>
  );
}
export default ChatBox;