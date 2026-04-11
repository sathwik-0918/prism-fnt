// components/chat/MessageBubble.jsx
// renders a single chat message
// user messages: right aligned, dark background
// assistant messages: left aligned, light background
// features: copy button, edit button (user only), source badges

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

function MessageBubble({ message, onEdit }) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.content);

  async function handleCopy() {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleEditSubmit() {
    if (editText.trim() && editText !== message.content) {
      onEdit(editText);         // sends edited message as new query
    }
    setIsEditing(false);
  }

  return (
    <div className={`d-flex mb-3 ${isUser ? "justify-content-end" : "justify-content-start"}`}>
      <div style={{ maxWidth: "75%" }}>

        {/* message bubble */}
        {isEditing ? (
          // edit mode
          <div className="d-flex flex-column gap-2">
            <textarea
              className="form-control"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              rows={3}
              style={{ borderRadius: "12px", resize: "none" }}
              autoFocus
            />
            <div className="d-flex gap-2 justify-content-end">
              <button
                className="btn btn-sm btn-secondary"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-sm btn-dark"
                onClick={handleEditSubmit}
              >
                Send ↵
              </button>
            </div>
          </div>
        ) : (
          // normal message
          <div
            className={isUser ? "bg-dark text-white" : "bg-white text-dark border"}
            style={{
              borderRadius: isUser
                ? "18px 18px 4px 18px"
                : "18px 18px 18px 4px",
              padding: "12px 16px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            }}
          >
            {isUser ? (
              // user messages — plain text
              <p className="mb-0" style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
                {message.content}
              </p>
            ) : (
              // assistant messages — render markdown + math
              <div className="markdown-body">
                <ReactMarkdown
                  remarkPlugins={[remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            )}

            {/* source badges */}
            {message.sources?.length > 0 && (
              <div className="mt-2 d-flex flex-wrap gap-1">
                {message.sources.map((src, i) => (
                  <span
                    key={i}
                    className="badge bg-secondary"
                    style={{ fontSize: "0.7rem" }}
                  >
                    📄 {src}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* action buttons — shown on hover via CSS */}
        {!isEditing && (
          <div className={`d-flex gap-2 mt-1 ${isUser ? "justify-content-end" : "justify-content-start"}`}>
            {/* copy button — both user and assistant */}
            <button
              className="btn btn-sm text-secondary p-0"
              onClick={handleCopy}
              title="Copy message"
              style={{ fontSize: "0.75rem", background: "none", border: "none" }}
            >
              {copied ? "✅ Copied" : "📋 Copy"}
            </button>

            {/* edit button — user messages only */}
            {isUser && (
              <button
                className="btn btn-sm text-secondary p-0"
                onClick={() => setIsEditing(true)}
                title="Edit message"
                style={{ fontSize: "0.75rem", background: "none", border: "none" }}
              >
                ✏️ Edit
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default MessageBubble;