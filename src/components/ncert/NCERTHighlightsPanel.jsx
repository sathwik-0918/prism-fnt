// components/ncert/NCERTHighlightsPanel.jsx
// Shows all saved highlights organized by subject → chapter → topic

import { useState, useEffect } from "react";
import axios from "axios";

const BASE = "http://localhost:8000/api";

const COLOR_STYLES = {
  yellow: { bg: "#fff9c4", border: "#ffc107", label: "Key Fact" },
  green:  { bg: "#c8e6c9", border: "#4caf50", label: "Formula" },
  blue:   { bg: "#bbdefb", border: "#2196f3", label: "Definition" },
  pink:   { bg: "#f8bbd0", border: "#e91e63", label: "Exam Tip" },
};

function NCERTHighlightsPanel({ userId }) {
  const [highlights, setHighlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    loadHighlights();
  }, []);

  async function loadHighlights() {
    try {
      const res = await axios.get(`${BASE}/ncert/highlights/${userId}`);
      setHighlights(res.data.payload || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function deleteHighlight(id) {
    await axios.delete(`${BASE}/ncert/highlight/${id}`, { params: { userId } });
    setHighlights(prev => prev.filter(h => h.highlightId !== id));
  }

  // group by subject + chapter
  const grouped = highlights.reduce((acc, h) => {
    const key = `${h.subject} · ${h.chapterTitle}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(h);
    return acc;
  }, {});

  const filtered = filter === "all"
    ? highlights
    : highlights.filter(h => h.color === filter);

  if (loading) return <div className="text-center py-5"><div className="spinner-border" /></div>;

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
        <h5 className="fw-bold mb-0">🟡 My Highlights ({highlights.length})</h5>
        <div className="d-flex gap-2 flex-wrap">
          <button
            className={`btn btn-sm ${filter === "all" ? "btn-dark" : "btn-outline-secondary"}`}
            style={{ borderRadius: "20px" }}
            onClick={() => setFilter("all")}
          >
            All
          </button>
          {Object.entries(COLOR_STYLES).map(([key, cfg]) => (
            <button
              key={key}
              className="btn btn-sm"
              style={{
                borderRadius: "20px",
                background: filter === key ? cfg.bg : "transparent",
                border: `2px solid ${cfg.border}`,
                color: "#212529"
              }}
              onClick={() => setFilter(key)}
            >
              {cfg.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-5 text-secondary">
          <div style={{ fontSize: "3rem" }}>🟡</div>
          <p>No highlights yet. Select text while reading to highlight it!</p>
        </div>
      ) : (
        <div className="row g-3">
          {filtered.map(h => {
            const cfg = COLOR_STYLES[h.color] || COLOR_STYLES.yellow;
            return (
              <div key={h.highlightId} className="col-md-6">
                <div
                  className="p-3 rounded"
                  style={{
                    background: cfg.bg,
                    border: `2px solid ${cfg.border}44`,
                    borderLeft: `4px solid ${cfg.border}`,
                    position: "relative"
                  }}
                >
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <span
                        className="badge mb-1"
                        style={{ background: cfg.border, fontSize: "0.65rem" }}
                      >
                        {cfg.label}
                      </span>
                      <div className="small text-secondary">
                        {h.subject} · Ch{h.chapterNum} · {h.topic}
                      </div>
                    </div>
                    <button
                      className="btn btn-sm text-danger p-0"
                      style={{ background: "none", border: "none" }}
                      onClick={() => deleteHighlight(h.highlightId)}
                    >
                      ×
                    </button>
                  </div>
                  <p className="mb-0" style={{ fontSize: "0.9rem", fontStyle: "italic" }}>
                    "{h.highlightedText}"
                  </p>
                  <small className="text-secondary mt-1 d-block">
                    {new Date(h.savedAt).toLocaleDateString()}
                  </small>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default NCERTHighlightsPanel;