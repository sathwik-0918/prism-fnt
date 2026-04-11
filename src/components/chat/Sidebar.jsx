// components/chat/Sidebar.jsx
// left sidebar showing all chat sessions
// new chat button, session list, delete session
// exactly like ChatGPT/Claude sidebar

import { useEffect, useState } from "react";
import { useChatContext } from "../../contexts/ChatContext";
import { useUserContext } from "../../contexts/UserContext";

function Sidebar({ isOpen, onClose }) {
  const { sessions, activeSession, loadSessions,
          loadSession, removeSession, startNewChat } = useChatContext();
  const { currentUser } = useUserContext();
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (currentUser?.userId) {
      loadSessions(currentUser.userId);
    }
  }, [currentUser?.userId]);

  async function handleSelectSession(sessionId) {
    await loadSession(currentUser.userId, sessionId);
    onClose();               // close sidebar on mobile after selection
  }

  async function handleDeleteSession(e, sessionId) {
    e.stopPropagation();     // don't trigger session select
    setDeletingId(sessionId);
    await removeSession(currentUser.userId, sessionId);
    setDeletingId(null);
  }

  async function handleNewChat() {
    startNewChat();     // ← use startNewChat not setActiveSession(null)
    onClose();
  }

  // group sessions by date
  function groupByDate(sessions) {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    const groups = { Today: [], Yesterday: [], Earlier: [] };

    sessions.forEach((s) => {
      const date = new Date(s.updatedAt).toDateString();
      if (date === today) groups.Today.push(s);
      else if (date === yesterday) groups.Yesterday.push(s);
      else groups.Earlier.push(s);
    });

    return groups;
  }

  const grouped = groupByDate(sessions);

  return (
    <>
      {/* overlay for mobile */}
      {isOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100"
          style={{ background: "rgba(0,0,0,0.5)", zIndex: 999 }}
          onClick={onClose}
        />
      )}

      {/* sidebar */}
      <div
        className="position-fixed top-0 start-0 h-100 bg-dark text-white d-flex flex-column"
        style={{
          width: "280px",
          zIndex: 1000,
          transform: isOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.3s ease",
          overflowY: "auto",
        }}
      >
        {/* header */}
        <div className="d-flex align-items-center justify-content-between p-3 border-bottom border-secondary">
          <span className="fw-bold fs-5">🔷 Prism</span>
          <button
            className="btn btn-sm btn-outline-light"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {/* new chat button */}
        <div className="p-3">
          <button
            className="btn btn-outline-light w-100 d-flex align-items-center gap-2"
            onClick={handleNewChat}
          >
            <span>＋</span> New Chat
          </button>
        </div>

        {/* sessions list grouped by date */}
        <div className="flex-grow-1 overflow-auto px-2">
          {Object.entries(grouped).map(([group, groupSessions]) =>
            groupSessions.length > 0 ? (
              <div key={group} className="mb-3">
                <p className="text-secondary small px-2 mb-1">{group}</p>
                {groupSessions.map((session) => (
                  <div
                    key={session.sessionId}
                    className={`d-flex align-items-center justify-content-between p-2 rounded mb-1 cursor-pointer ${
                      activeSession?.sessionId === session.sessionId
                        ? "bg-secondary"
                        : "hover-bg-secondary"
                    }`}
                    onClick={() => handleSelectSession(session.sessionId)}
                    style={{ cursor: "pointer" }}
                  >
                    <span
                      className="text-truncate small"
                      style={{ maxWidth: "210px" }}
                      title={session.title}
                    >
                      💬 {session.title}
                    </span>

                    {/* delete button */}
                    <button
                      className="btn btn-sm text-secondary p-0 ms-1"
                      onClick={(e) => handleDeleteSession(e, session.sessionId)}
                      title="Delete chat"
                      style={{ opacity: deletingId === session.sessionId ? 0.5 : 1 }}
                    >
                      🗑
                    </button>
                  </div>
                ))}
              </div>
            ) : null
          )}

          {sessions.length === 0 && (
            <p className="text-secondary small text-center mt-4">
              No chats yet. Start a new conversation!
            </p>
          )}
        </div>

        {/* user info at bottom */}
        <div className="p-3 border-top border-secondary">
          <p className="small text-secondary mb-0">
            {currentUser?.firstName} — {currentUser?.examTarget}
          </p>
        </div>
      </div>
    </>
  );
}

export default Sidebar;