// components/concept/ConceptPreviewCard.jsx
// Compact preview for the homepage — entices users to sign in
import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const BASE = "http://localhost:8000/api";

const DIFFICULTY_STYLE = {
  easy: { bg: "#d4edda", color: "#155724", label: "Easy" },
  medium: { bg: "#fff3cd", color: "#856404", label: "Medium" },
  hard: { bg: "#f8d7da", color: "#721c24", label: "Hard" }
};

function ConceptPreviewCard({ examTarget = "JEE" }) {
  const [concept, setConcept] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchConcept() {
      try {
        const res = await axios.get(`${BASE}/concept-of-day/${examTarget}`);
        if (res.data.payload) {
          setConcept(res.data.payload);
        }
      } catch (err) {
        console.error("Failed to load concept preview:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchConcept();
  }, [examTarget]);

  if (loading) {
    return (
      <div className="card shadow-sm border-0 p-4 text-center" style={{ borderRadius: "16px", minHeight: "150px" }}>
        <div className="spinner-border spinner-border-sm text-dark mx-auto" />
      </div>
    );
  }

  if (!concept) return null; // hide if error

  const diff = DIFFICULTY_STYLE[concept.difficulty] || DIFFICULTY_STYLE.medium;

  return (
    <div 
      className="card shadow-lg border-0 overflow-hidden mx-auto" 
      style={{ 
        maxWidth: "600px", 
        borderRadius: "20px",
        transition: "transform 0.3s ease" 
      }}
    >
      <div className="d-flex flex-column flex-md-row">
        {/* left accent / image placeholder */}
        <div 
          className="d-flex align-items-center justify-content-center"
          style={{ 
            background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
            color: "white",
            minWidth: "120px",
            fontSize: "2.5rem"
          }}
        >
          🧠
        </div>

        {/* content */}
        <div className="p-4 flex-grow-1 text-start">
          <div className="d-flex gap-2 mb-2">
            <span className="badge bg-light text-dark border">Concept of the Day</span>
            <span className="badge" style={{ background: diff.bg, color: diff.color }}>
              {diff.label}
            </span>
          </div>
          
          <h4 className="fw-bold mb-1">{concept.topic}</h4>
          <p className="text-secondary small mb-3">{concept.tagline}</p>
          
          <div className="d-flex align-items-center justify-content-between border-top pt-3 mt-2">
            <span className="text-secondary small">Read formulas, mnemonics & PYQs</span>
            <Link to="/signin" className="btn btn-sm btn-dark px-3 rounded-pill fw-semibold">
              Read More →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConceptPreviewCard;