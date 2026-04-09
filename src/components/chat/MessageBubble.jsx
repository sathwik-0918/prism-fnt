function MessageBubble({ message }) {
  const isUser = message.role === "user";

  return (
    <div className={`d-flex mb-3 ${isUser ? "justify-content-end" : "justify-content-start"}`}>
      <div
        style={{ maxWidth: "70%", borderRadius: "16px", padding: "12px 16px" }}
        className={isUser ? "bg-dark text-white" : "bg-light text-dark border"}
      >
        <p className="mb-1" style={{ whiteSpace: "pre-wrap" }}>{message.content}</p>
        {message.sources?.length > 0 && (
          <div className="mt-2">
            {message.sources.map((src, i) => (
              <span key={i} className="badge bg-secondary me-1" style={{ fontSize: "0.7rem" }}>
                📄 {src}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
export default MessageBubble;