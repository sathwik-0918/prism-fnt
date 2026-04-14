// components/ncert/NCERTPage.jsx
// Landing page for NCERT Line-by-Line feature
// Shows before AND after login
// Displays subjects → class → chapters

import { useState, useEffect } from "react";
import { useUserContext } from "../../contexts/UserContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import NCERTHighlightsPanel from "./NCERTHighlightsPanel";

const BASE = "http://localhost:8000/api";

const WEIGHTAGE_CONFIG = {
  very_high: { label: "Very High", color: "#dc3545", bg: "#fff5f5", stars: "⭐⭐⭐⭐⭐" },
  high:      { label: "High",      color: "#fd7e14", bg: "#fff8f0", stars: "⭐⭐⭐⭐" },
  medium:    { label: "Medium",    color: "#ffc107", bg: "#fffff0", stars: "⭐⭐⭐" },
  low:       { label: "Low",       color: "#6c757d", bg: "#f8f9fa", stars: "⭐⭐" },
};

function NCERTPage() {
  const { currentUser } = useUserContext();
  const navigate = useNavigate();

  const [catalog, setCatalog] = useState({});
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [activeTab, setActiveTab] = useState("chapters"); // chapters | highlights
  const [loading, setLoading] = useState(false);
  const [userProgress, setUserProgress] = useState([]);

  const examTarget = currentUser?.examTarget || "JEE";

  useEffect(() => {
    loadCatalog();
  }, [examTarget]);

  useEffect(() => {
    if (currentUser?.userId) {
      loadProgress();
    }
  }, [currentUser?.userId]);

  async function loadCatalog() {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE}/ncert/catalog`, {
        params: { examTarget }
      });
      const cat = res.data.payload || {};
      setCatalog(cat);
      // auto-select first subject
      const subjects = Object.keys(cat);
      if (subjects.length > 0) {
        setSelectedSubject(subjects[0]);
        setSelectedClass("Class 11");
      }
    } catch (err) {
      console.error("Failed to load catalog:", err);
    } finally {
      setLoading(false);
    }
  }

  async function loadProgress() {
    try {
      const res = await axios.get(`${BASE}/ncert/progress/${currentUser.userId}`);
      setUserProgress(res.data.payload || []);
    } catch { }
  }

  function getChapterProgress(subject, classNum, chapterNum) {
    const key = `${currentUser?.userId}_${subject}_${classNum}_${chapterNum}`;
    return userProgress.find(p => p.progressKey === key);
  }

  const subjects = Object.keys(catalog);
  const classes = selectedSubject ? Object.keys(catalog[selectedSubject] || {}) : [];
  const chapters = selectedSubject && selectedClass
    ? catalog[selectedSubject]?.[selectedClass] || []
    : [];

  // sort chapters by weightage
  const sortedChapters = [...chapters].sort((a, b) => {
    const order = { very_high: 0, high: 1, medium: 2, low: 3 };
    return (order[a.weightage] || 3) - (order[b.weightage] || 3);
  });

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa" }}>

      {/* Hero Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
          color: "white",
          padding: "3rem 2rem",
          textAlign: "center"
        }}
      >
        <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>📚</div>
        <h1 style={{ fontWeight: 800, fontSize: "clamp(1.8rem, 5vw, 3rem)", marginBottom: "0.5rem" }}>
          NCERT Line by Line
        </h1>
        <p style={{ opacity: 0.75, fontSize: "1.1rem", maxWidth: "600px", margin: "0 auto" }}>
          Every line. Every reaction. Every diagram.
          Master NCERT the way toppers do — no line left behind.
        </p>
        {!currentUser && (
          <div className="mt-4 d-flex gap-3 justify-content-center flex-wrap">
            <button
              className="btn btn-light btn-lg fw-bold"
              style={{ borderRadius: "30px", padding: "12px 32px" }}
              onClick={() => navigate("/signin")}
            >
              Start Reading →
            </button>
          </div>
        )}

        {/* Stats bar */}
        <div className="d-flex gap-4 justify-content-center mt-4 flex-wrap">
          {[
            { value: "450+", label: "NCERT Topics" },
            { value: "1000+", label: "PYQs Analyzed" },
            { value: "100%", label: "Syllabus Covered" },
            { value: "Zero", label: "Lines Missed" },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div style={{ fontSize: "1.8rem", fontWeight: 800 }}>{stat.value}</div>
              <div style={{ opacity: 0.6, fontSize: "0.85rem" }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="container-fluid py-4" style={{ maxWidth: "1200px" }}>

        {/* Tab Navigation */}
        {currentUser && (
          <div className="d-flex gap-2 mb-4">
            <button
              className={`btn fw-semibold ${activeTab === "chapters" ? "btn-dark" : "btn-outline-secondary"}`}
              style={{ borderRadius: "20px" }}
              onClick={() => setActiveTab("chapters")}
            >
              📖 Chapters
            </button>
            <button
              className={`btn fw-semibold ${activeTab === "highlights" ? "btn-dark" : "btn-outline-secondary"}`}
              style={{ borderRadius: "20px" }}
              onClick={() => setActiveTab("highlights")}
            >
              🟡 My Highlights
            </button>
          </div>
        )}

        {activeTab === "highlights" && currentUser ? (
          <NCERTHighlightsPanel userId={currentUser.userId} />
        ) : (
          <>
            {/* Subject selector */}
            <div className="d-flex gap-3 mb-4 flex-wrap">
              {subjects.map(subject => (
                <button
                  key={subject}
                  className={`btn btn-lg fw-bold ${selectedSubject === subject ? "btn-dark" : "btn-outline-dark"}`}
                  style={{ borderRadius: "16px", padding: "12px 28px" }}
                  onClick={() => { setSelectedSubject(subject); setSelectedClass("Class 11"); }}
                >
                  {subject === "Chemistry" ? "⚗️" : "🧬"} {subject}
                  {subject === "Chemistry" && <span className="badge bg-danger ms-2 small">JEE + NEET</span>}
                  {subject === "Biology" && <span className="badge bg-success ms-2 small">NEET only</span>}
                </button>
              ))}
            </div>

            {/* Class selector */}
            {selectedSubject && (
              <div className="d-flex gap-2 mb-4">
                {classes.map(cls => (
                  <button
                    key={cls}
                    className={`btn ${selectedClass === cls ? "btn-dark" : "btn-outline-secondary"}`}
                    style={{ borderRadius: "20px" }}
                    onClick={() => setSelectedClass(cls)}
                  >
                    {cls}
                  </button>
                ))}
              </div>
            )}

            {/* Chapter cards */}
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-dark" />
              </div>
            ) : (
              <div className="row g-4">
                {sortedChapters.map(chapter => {
                  const wConfig = WEIGHTAGE_CONFIG[chapter.weightage] || WEIGHTAGE_CONFIG.medium;
                  const progress = getChapterProgress(
                    selectedSubject, selectedClass?.replace("Class ", ""), chapter.chapter
                  );
                  const progressPct = progress?.progressPercent || 0;

                  return (
                    <div key={chapter.chapter} className="col-md-6 col-lg-4">
                      <div
                        className="card h-100 shadow-sm"
                        style={{
                          borderRadius: "16px",
                          border: `2px solid ${wConfig.color}22`,
                          cursor: "pointer",
                          transition: "transform 0.2s, box-shadow 0.2s",
                          overflow: "hidden"
                        }}
                        onClick={() => {
                          if (currentUser) {
                            navigate(
                              `/dashboard/${currentUser.email}/ncert/${selectedSubject}/${selectedClass?.replace("Class ", "")}/${chapter.chapter}`,
                              { state: { chapter, subject: selectedSubject, classNum: selectedClass?.replace("Class ", "") } }
                            );
                          } else {
                            navigate("/signin");
                          }
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.transform = "translateY(-4px)";
                          e.currentTarget.style.boxShadow = `0 8px 24px ${wConfig.color}33`;
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.boxShadow = "";
                        }}
                      >
                        {/* Weightage indicator */}
                        <div
                          style={{
                            background: wConfig.color,
                            padding: "6px 16px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between"
                          }}
                        >
                          <span style={{ color: "white", fontSize: "0.8rem", fontWeight: 700 }}>
                            {wConfig.label} Priority
                          </span>
                          <span style={{ fontSize: "0.75rem" }}>{wConfig.stars}</span>
                        </div>

                        <div className="p-4">
                          <div className="d-flex align-items-start gap-3 mb-3">
                            <div
                              style={{
                                width: "44px", height: "44px",
                                borderRadius: "12px",
                                background: wConfig.bg,
                                border: `2px solid ${wConfig.color}44`,
                                display: "flex", alignItems: "center",
                                justifyContent: "center",
                                fontSize: "1.2rem", flexShrink: 0,
                                color: wConfig.color, fontWeight: 800
                              }}
                            >
                              {chapter.chapter}
                            </div>
                            <div>
                              <h6 className="fw-bold mb-1" style={{ fontSize: "0.95rem" }}>
                                {chapter.title}
                              </h6>
                              <div className="d-flex gap-2 flex-wrap">
                                <small style={{ color: wConfig.color, fontWeight: 600 }}>
                                  📊 {examTarget === "JEE"
                                    ? chapter.jeeMarks
                                    : chapter.neetMarks} marks
                                </small>
                                <small className="text-secondary">
                                  📝 {chapter.pyqCount}+ PYQs
                                </small>
                              </div>
                            </div>
                          </div>

                          {/* Tags */}
                          <div className="d-flex flex-wrap gap-1 mb-3">
                            {chapter.tags?.slice(0, 3).map(tag => (
                              <span
                                key={tag}
                                className="badge"
                                style={{
                                  background: wConfig.bg,
                                  color: wConfig.color,
                                  border: `1px solid ${wConfig.color}44`,
                                  fontSize: "0.65rem",
                                  borderRadius: "20px",
                                  padding: "3px 8px"
                                }}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>

                          {/* Progress bar */}
                          {currentUser && (
                            <div>
                              <div className="d-flex justify-content-between mb-1">
                                <small className="text-secondary">Reading Progress</small>
                                <small className="fw-bold" style={{ color: wConfig.color }}>
                                  {progressPct}%
                                  {progress?.revisionCount > 0 &&
                                    <span className="ms-1">· Rev {progress.revisionCount}</span>
                                  }
                                </small>
                              </div>
                              <div
                                style={{
                                  height: "6px",
                                  background: "#e9ecef",
                                  borderRadius: "10px",
                                  overflow: "hidden"
                                }}
                              >
                                <div
                                  style={{
                                    height: "100%",
                                    width: `${progressPct}%`,
                                    background: progressPct === 100
                                      ? "#28a745"
                                      : wConfig.color,
                                    borderRadius: "10px",
                                    transition: "width 0.5s ease"
                                  }}
                                />
                              </div>
                              {progressPct === 100 && (
                                <small className="text-success fw-bold mt-1 d-block">
                                  ✅ Completed! Click to revise
                                </small>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default NCERTPage;