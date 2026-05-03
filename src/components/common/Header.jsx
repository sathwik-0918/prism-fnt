import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useClerk, useUser } from "@clerk/react";
import { useUserContext } from "../../contexts/UserContext";

function Header({ onSidebarToggle }) {
  const { signOut } = useClerk();
  const { isSignedIn, user } = useUser();
  const { currentUser, setCurrentUser } = useUserContext();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropRef = useRef(null);

  const base = currentUser?.email ? `/dashboard/${currentUser.email}` : "";

  async function handleSignout() {
    await signOut();
    setCurrentUser(null);
    navigate("/");
  }

  // close dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <>
      <style>{`
        .prism-header {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 1000;
          height: 60px;
          background: #111827;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          display: flex;
          align-items: center;
          padding: 0 20px;
          gap: 12px;
          box-shadow: 0 1px 12px rgba(0,0,0,0.2);
          font-family: 'DM Sans', system-ui, sans-serif;
        }
        .prism-header .h-logo {
          font-size: 1.1rem;
          font-weight: 700;
          color: #ffffff;
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 8px;
          letter-spacing: -0.3px;
          flex-shrink: 0;
        }
        .prism-header .h-logo .logo-gem {
          width: 28px; height: 28px;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          color: white; font-size: 0.8rem;
        }
        .h-sidebar-btn {
          width: 36px; height: 36px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.05);
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          color: #f8fafc;
          font-size: 1rem;
          transition: all 0.15s;
          flex-shrink: 0;
        }
        .h-sidebar-btn:hover {
          background: rgba(255,255,255,0.1);
          border-color: rgba(255,255,255,0.18);
        }
        .h-spacer { flex: 1; }
        .h-pill {
          display: flex; align-items: center; gap: 6px;
          padding: 6px 13px;
          border-radius: 20px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.05);
          font-size: 0.8rem;
          font-weight: 500;
          color: rgba(255,255,255,0.82);
          cursor: pointer;
          text-decoration: none;
          transition: all 0.15s;
          white-space: nowrap;
          gap: 6px;
        }
        .h-pill:hover {
          background: rgba(255,255,255,0.1);
          border-color: rgba(255,255,255,0.18);
          color: #ffffff;
        }
        .h-pill .pill-dot {
          width: 7px; height: 7px;
          border-radius: 50%;
          background: #22c55e;
          display: inline-block;
          flex-shrink: 0;
        }
        .h-pill .pill-dot.amber { background: #f59e0b; }
        .h-profile-wrap { position: relative; flex-shrink: 0; }
        .h-profile-btn {
          display: flex; align-items: center; gap: 8px;
          padding: 4px 10px 4px 4px;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 24px;
          background: rgba(255,255,255,0.05);
          cursor: pointer;
          transition: all 0.15s;
        }
        .h-profile-btn:hover {
          background: rgba(255,255,255,0.1);
          border-color: rgba(255,255,255,0.18);
        }
        .h-profile-btn img {
          width: 28px; height: 28px;
          border-radius: 50%;
          object-fit: cover;
        }
        .h-profile-btn .h-name {
          font-size: 0.82rem;
          font-weight: 600;
          color: #ffffff;
          max-width: 90px;
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .h-profile-btn .h-chevron { color: rgba(255,255,255,0.52); font-size: 0.6rem; }
        .h-dropdown {
          position: absolute;
          top: calc(100% + 6px);
          right: 0;
          background: #fff;
          border: 1px solid #ebebeb;
          border-radius: 12px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.1);
          min-width: 200px;
          overflow: hidden;
          animation: dropIn 0.15s ease;
        }
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .h-drop-header {
          padding: 14px 16px 10px;
          border-bottom: 1px solid #f3f3f3;
        }
        .h-drop-header .hd-name { font-weight: 700; font-size: 0.88rem; color: #111; }
        .h-drop-header .hd-email { font-size: 0.75rem; color: #888; margin-top: 1px; }
        .h-drop-item {
          display: flex; align-items: center; gap: 9px;
          padding: 10px 16px;
          font-size: 0.83rem;
          color: #444;
          cursor: pointer;
          transition: background 0.12s;
          text-decoration: none;
          border: none; background: none; width: 100%; text-align: left;
        }
        .h-drop-item:hover { background: #f8f8f8; color: #111; }
        .h-drop-item.danger { color: #ef4444; }
        .h-drop-item.danger:hover { background: #fef2f2; }
        .h-drop-divider { height: 1px; background: #f3f3f3; margin: 2px 0; }
        @media (max-width: 640px) {
          .h-pill.hide-sm { display: none; }
        }
      `}</style>

      <header className="prism-header">
        {/* Sidebar toggle — only shown when signed in */}
        {isSignedIn && onSidebarToggle && (
          <button
            className="h-sidebar-btn"
            onClick={onSidebarToggle}
            title="Toggle sidebar"
          >
            ☰
          </button>
        )}

        {/* Logo */}
        <Link to="/" className="h-logo">
          <span className="logo-gem">P</span>
          Prism
        </Link>

        <div className="h-spacer" />

        {isSignedIn && currentUser && (
          <>
            {/* Concept of the Day pill */}
            <button
              className="h-pill hide-sm"
              onClick={() => navigate(`${base}/concept`)}
            >
              <span className="pill-dot amber" />
              Concept of the Day
            </button>

            {/* Leaderboard pill */}
            <button
              className="h-pill hide-sm"
              onClick={() => navigate(`${base}/leaderboard`)}
            >
              Leaderboard
            </button>

            {/* Profile + dropdown */}
            <div className="h-profile-wrap" ref={dropRef}>
              <button
                className="h-profile-btn"
                onClick={() => setDropdownOpen((v) => !v)}
              >
                <img src={user.imageUrl} alt="" />
                <span className="h-name">{user.firstName}</span>
                <span className="h-chevron">v</span>
              </button>

              {dropdownOpen && (
                <div className="h-dropdown">
                  <div className="h-drop-header">
                    <div className="hd-name">
                      {user.firstName} {user.lastName}
                    </div>
                    <div className="hd-email">
                      {user.emailAddresses[0]?.emailAddress}
                    </div>
                  </div>
                  <Link
                    to={`${base}/personalization`}
                    className="h-drop-item"
                    onClick={() => setDropdownOpen(false)}
                  >
                    My Profile
                  </Link>
                  <div className="h-drop-divider" />
                  <button
                    className="h-drop-item danger"
                    onClick={handleSignout}
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {!isSignedIn && (
          <div style={{ display: "flex", gap: 8 }}>
            <Link
              to="signin"
              style={{
                padding: "7px 16px",
                borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.12)",
                fontSize: "0.83rem",
                fontWeight: 500,
                color: "#f8fafc",
                textDecoration: "none",
                background: "rgba(255,255,255,0.05)",
              }}
            >
              Sign In
            </Link>
            <Link
              to="signup"
              style={{
                padding: "7px 16px",
                borderRadius: 8,
                border: "none",
                fontSize: "0.83rem",
                fontWeight: 600,
                color: "#fff",
                textDecoration: "none",
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              }}
            >
              Sign Up
            </Link>
          </div>
        )}
      </header>

      {/* Spacer so content doesn't hide under fixed header */}
      <div style={{ height: 60 }} />
    </>
  );
}

export default Header;
