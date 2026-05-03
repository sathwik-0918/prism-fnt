function Footer() {
  return (
    <>
      <style>{`
        .prism-footer {
          background: #111827;
          border-top: 1px solid rgba(255,255,255,0.08);
          padding: 16px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 8px;
          font-family: 'DM Sans', system-ui, sans-serif;
          font-size: 0.78rem;
          color: rgba(255,255,255,0.5);
        }
        .prism-footer .f-brand {
          display: flex; align-items: center; gap: 6px;
          font-weight: 600; color: rgba(255,255,255,0.72);
        }
        .prism-footer .f-brand .f-gem {
          width: 18px; height: 18px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border-radius: 4px;
          display: inline-flex; align-items: center; justify-content: center;
          color: white; font-size: 0.5rem;
        }
        .prism-footer .f-links {
          display: flex; gap: 16px;
        }
        .prism-footer .f-links span {
          cursor: default;
          transition: color 0.15s;
        }
        .prism-footer .f-links span:hover { color: #ffffff; }
      `}</style>
      <footer className="prism-footer">
        <div className="f-brand">
          <span className="f-gem">P</span> 2025 Prism - AI-Powered JEE/NEET
          Preparation
        </div>
        <div className="f-links">
          <span>Built for JEE &amp; NEET</span>
          <span>v2.0</span>
        </div>
      </footer>
    </>
  );
}

export default Footer;
