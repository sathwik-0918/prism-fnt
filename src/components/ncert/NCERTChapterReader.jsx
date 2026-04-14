// components/ncert/NCERTChapterReader.jsx
// The main reading experience
// Generates content on-demand, caches globally
// Supports highlighting, progress tracking, revision mode

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useUserContext } from "../../contexts/UserContext";
import axios from "axios";
import MathRenderer from "../common/MathRenderer";

const BASE = "http://localhost:8000/api";

const HIGHLIGHT_COLORS = [
  { key: "yellow", bg: "#fff9c4", border: "#ffc107", label: "Key Fact" },
  { key: "green",  bg: "#c8e6c9", border: "#4caf50", label: "Formula" },
  { key: "blue",   bg: "#bbdefb", border: "#2196f3", label: "Definition" },
  { key: "pink",   bg: "#f8bbd0", border: "#e91e63", label: "Exam Tip" },
];

// List of all topics per chapter (sub-topics from chapter tags + common ones)
function getTopicsForChapter(chapter, subject) {
  const baseTags = chapter?.tags || [];
  const title = chapter?.title || "";

  // generate sensible topic list from tags
  const topics = [
    `Introduction to ${title}`,
    ...baseTags.map(tag => `${tag.charAt(0).toUpperCase() + tag.slice(1)}`),
    `Important Reactions in ${title}`,
    `Properties and Comparisons`,
    `NCERT Examples and Solved Problems`,
    `Previous Year Questions Analysis`,
    `Common Mistakes and Misconceptions`,
  ];

  return [...new Set(topics)].filter(Boolean);
}

function TopicCard({
  topic, index, isSelected, isCompleted, isGenerating, onClick
}) {
  return (
    <div
      className="d-flex align-items-center gap-3 p-3 rounded mb-2"
      style={{
        cursor: "pointer",
        background: isSelected ? "#1a1a2e" : isCompleted ? "#e8f5e9" : "#f8f9fa",
        color: isSelected ? "white" : "#212529",
        border: isSelected ? "none" : `1px solid ${isCompleted ? "#4caf50" : "#e9ecef"}`,
        transition: "all 0.2s"
      }}
      onClick={onClick}
    >
      <div
        style={{
          width: "28px", height: "28px",
          borderRadius: "50%",
          background: isCompleted ? "#4caf50" : isSelected ? "rgba(255,255,255,0.2)" : "#e9ecef",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "0.8rem", fontWeight: 700,
          color: isCompleted ? "white" : isSelected ? "white" : "#666",
          flexShrink: 0
        }}
      >
        {isCompleted ? "✓" : index + 1}
      </div>
      <span style={{ fontSize: "0.9rem", flex: 1 }}>{topic}</span>
      {isGenerating && (
        <div className="spinner-border spinner-border-sm" style={{ width: "14px", height: "14px" }} />
      )}
    </div>
  );
}

function ContentSection({ section, onHighlight }) {
  const sectionRef = useRef(null);
  const [showHighlightMenu, setShowHighlightMenu] = useState(false);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
  const [selectedText, setSelectedText] = useState("");

  function handleMouseUp() {
    const selection = window.getSelection();
    const text = selection?.toString().trim();
    if (text && text.length > 10) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setSelectedText(text);
      setMenuPos({
        x: rect.left + rect.width / 2,
        y: rect.top - 50 + window.scrollY
      });
      setShowHighlightMenu(true);
    } else {
      setShowHighlightMenu(false);
    }
  }

  function handleHighlight(color) {
    if (selectedText) {
      onHighlight(selectedText, color);
    }
    setShowHighlightMenu(false);
    window.getSelection()?.removeAllRanges();
  }

  return (
    <div
      ref={sectionRef}
      className="mb-4 p-4 rounded"
      style={{
        background: section.isKey ? "#fffbf0" : "white",
        border: section.isKey ? "1px solid #ffc10744" : "1px solid #e9ecef",
        position: "relative"
      }}
      onMouseUp={handleMouseUp}
    >
      {section.isKey && (
        <div
          className="position-absolute"
          style={{
            left: "-4px", top: "16px",
            width: "4px", height: "32px",
            background: "#ffc107",
            borderRadius: "2px"
          }}
        />
      )}

      <h6 className="fw-bold mb-3" style={{ color: section.isKey ? "#b45309" : "#212529" }}>
        {section.isKey && "⭐ "}{section.heading}
      </h6>

      <MathRenderer content={section.content} />

      {/* Highlight menu */}
      {showHighlightMenu && (
        <div
          style={{
            position: "fixed",
            left: menuPos.x,
            top: menuPos.y,
            transform: "translateX(-50%)",
            zIndex: 1000,
            background: "white",
            borderRadius: "12px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
            padding: "8px",
            display: "flex",
            gap: "8px",
            alignItems: "center"
          }}
          onMouseLeave={() => setShowHighlightMenu(false)}
        >
          <span style={{ fontSize: "0.75rem", color: "#666", marginRight: "4px" }}>
            Highlight:
          </span>
          {HIGHLIGHT_COLORS.map(hc => (
            <button
              key={hc.key}
              title={hc.label}
              style={{
                width: "24px", height: "24px",
                borderRadius: "50%",
                background: hc.bg,
                border: `2px solid ${hc.border}`,
                cursor: "pointer"
              }}
              onClick={() => handleHighlight(hc.key)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function NCERTChapterReader() {
  const { subject, classNum, chapterNum } = useParams();
  const { state } = useLocation();
  const { currentUser } = useUserContext();
  const navigate = useNavigate();

  const chapter = state?.chapter;
  const topics = getTopicsForChapter(chapter, subject);

  const [selectedTopicIdx, setSelectedTopicIdx] = useState(0);
  const [content, setContent] = useState(null);
  const [generatingTopics, setGeneratingTopics] = useState(new Set());
  const [completedTopics, setCompletedTopics] = useState(new Set());
  const [startDate, setStartDate] = useState(null);
  const [targetDate, setTargetDate] = useState("");
  const [revisionCount, setRevisionCount] = useState(0);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const contentRef = useRef(null);
  const readTimer = useRef(null);
  const [readingTime, setReadingTime] = useState(0);

  const progressPct = Math.round((completedTopics.size / topics.length) * 100);

  useEffect(() => {
    loadUserProgress();
    loadTopic(topics[0], 0);
  }, []);

  // reading timer
  useEffect(() => {
    readTimer.current = setInterval(() => {
      setReadingTime(prev => prev + 1);
    }, 60000);
    return () => clearInterval(readTimer.current);
  }, []);

  async function loadUserProgress() {
    if (!currentUser?.userId) return;
    try {
      const res = await axios.get(`${BASE}/ncert/progress/${currentUser.userId}`);
      const allProgress = res.data.payload || [];
      const myProgress = allProgress.find(
        p => p.subject === subject &&
             p.classNum === classNum &&
             p.chapterNum === parseInt(chapterNum)
      );
      if (myProgress) {
        setCompletedTopics(new Set(myProgress.completedTopics));
        setRevisionCount(myProgress.revisionCount || 0);
        if (myProgress.targetDate) setTargetDate(myProgress.targetDate);
        if (myProgress.startDate) setStartDate(myProgress.startDate);
      }
    } catch { }
  }

  async function loadTopic(topic, idx) {
    setSelectedTopicIdx(idx);
    setContent(null);

    const cacheKey = `${subject}_${classNum}_${chapterNum}_${topic}`
      .replace(/\s+/g, "_").toLowerCase();

    // check cache first
    try {
      const cached = await axios.get(`${BASE}/ncert/content/${cacheKey}`);
      if (cached.data.payload) {
        setContent(cached.data.payload);
        return;
      }
    } catch { }

    // generate
    setGeneratingTopics(prev => new Set([...prev, topic]));
    try {
      const res = await axios.post(`${BASE}/ncert/generate`, {
        subject,
        classNum,
        chapterNum: parseInt(chapterNum),
        topic,
        examTarget: currentUser?.examTarget || "JEE"
      });
      setContent(res.data.payload);
    } catch (err) {
      console.error("Generation failed:", err);
    } finally {
      setGeneratingTopics(prev => {
        const next = new Set(prev);
        next.delete(topic);
        return next;
      });
    }
  }

  async function markTopicComplete() {
    const topic = topics[selectedTopicIdx];
    const newCompleted = new Set([...completedTopics, topic]);
    setCompletedTopics(newCompleted);

    if (!startDate) setStartDate(now());

    // save progress
    if (currentUser?.userId) {
      await axios.post(`${BASE}/ncert/progress`, {
        userId: currentUser.userId,
        subject,
        classNum,
        chapterNum: parseInt(chapterNum),
        chapterTitle: chapter?.title || "",
        completedTopics: [...newCompleted],
        totalTopics: topics.length,
        startDate: startDate || new Date().toISOString(),
        targetDate,
        revisionCount
      });
    }

    // auto-advance to next topic
    if (selectedTopicIdx < topics.length - 1) {
      const next = selectedTopicIdx + 1;
      loadTopic(topics[next], next);
      contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  async function resetProgress() {
    if (!window.confirm("Reset progress and start revision?")) return;
    const newRevCount = revisionCount + 1;
    setRevisionCount(newRevCount);
    setCompletedTopics(new Set());

    if (currentUser?.userId) {
      await axios.post(
        `${BASE}/ncert/progress/${currentUser.userId}/${subject}/${classNum}/${chapterNum}/reset`
      );
    }
    setSelectedTopicIdx(0);
    loadTopic(topics[0], 0);
  }

  async function saveHighlight(text, color) {
    if (!currentUser?.userId) return;
    try {
      await axios.post(`${BASE}/ncert/highlight`, {
        userId: currentUser.userId,
        subject,
        classNum,
        chapterNum: parseInt(chapterNum),
        chapterTitle: chapter?.title || "",
        topic: topics[selectedTopicIdx],
        highlightedText: text,
        color
      });
      alert("✅ Highlight saved to your notebook!");
    } catch (err) {
      console.error("Failed to save highlight:", err);
    }
  }

  function now() {
    return new Date().toISOString();
  }

  const daysRemaining = targetDate
    ? Math.max(0, Math.ceil((new Date(targetDate) - new Date()) / 86400000))
    : null;

  return (
    <div style={{ display: "flex", height: "calc(100vh - 60px)", overflow: "hidden" }}>

      {/* LEFT SIDEBAR — Topic List */}
      <div
        style={{
          width: "300px",
          flexShrink: 0,
          background: "white",
          borderRight: "1px solid #e9ecef",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden"
        }}
      >
        {/* Chapter header */}
        <div
          style={{
            background: "#1a1a2e",
            color: "white",
            padding: "1rem"
          }}
        >
          <button
            className="btn btn-sm btn-outline-light mb-2"
            style={{ borderRadius: "20px", fontSize: "0.75rem" }}
            onClick={() => navigate(-1)}
          >
            ← Back
          </button>
          <h6 className="fw-bold mb-1" style={{ fontSize: "0.9rem" }}>
            Ch {chapterNum}. {chapter?.title}
          </h6>
          <small style={{ opacity: 0.7 }}>
            {subject} — {classNum && `Class ${classNum}`}
          </small>
        </div>

        {/* Progress */}
        <div className="p-3 border-bottom">
          <div className="d-flex justify-content-between mb-1">
            <small className="fw-semibold">Overall Progress</small>
            <small className="fw-bold" style={{ color: progressPct === 100 ? "#28a745" : "#212529" }}>
              {progressPct}%
            </small>
          </div>
          <div style={{ height: "8px", background: "#e9ecef", borderRadius: "10px", overflow: "hidden" }}>
            <div
              style={{
                height: "100%",
                width: `${progressPct}%`,
                background: progressPct === 100 ? "#28a745" : "#0d6efd",
                borderRadius: "10px",
                transition: "width 0.5s"
              }}
            />
          </div>

          <div className="d-flex gap-2 mt-2 flex-wrap">
            {/* Target date */}
            <button
              className="btn btn-sm btn-outline-secondary"
              style={{ borderRadius: "20px", fontSize: "0.7rem" }}
              onClick={() => setShowDatePicker(!showDatePicker)}
            >
              📅 {targetDate ? `Target: ${new Date(targetDate).toLocaleDateString()}` : "Set target date"}
            </button>
          </div>

          {showDatePicker && (
            <input
              type="date"
              className="form-control form-control-sm mt-2"
              value={targetDate}
              onChange={e => { setTargetDate(e.target.value); setShowDatePicker(false); }}
              min={new Date().toISOString().split("T")[0]}
            />
          )}

          {daysRemaining !== null && (
            <div className="mt-2">
              <small className={`fw-semibold ${daysRemaining < 3 ? "text-danger" : "text-secondary"}`}>
                ⏱️ {daysRemaining} days remaining
              </small>
              {/* Real-time progress based on time */}
              {startDate && targetDate && (
                <div className="mt-1">
                  <div style={{ height: "4px", background: "#e9ecef", borderRadius: "10px" }}>
                    <div style={{
                      height: "100%",
                      width: `${Math.min(100, Math.round(
                        (new Date() - new Date(startDate)) /
                        (new Date(targetDate) - new Date(startDate)) * 100
                      ))}%`,
                      background: "#ffc107",
                      borderRadius: "10px"
                    }} />
                  </div>
                  <small className="text-secondary" style={{ fontSize: "0.65rem" }}>
                    Time elapsed
                  </small>
                </div>
              )}
            </div>
          )}

          {revisionCount > 0 && (
            <small className="text-success d-block mt-1">
              🔄 Revision #{revisionCount} in progress
            </small>
          )}

          {progressPct === 100 && (
            <button
              className="btn btn-sm btn-outline-success w-100 mt-2"
              style={{ borderRadius: "20px", fontSize: "0.75rem" }}
              onClick={resetProgress}
            >
              🔄 Start Revision #{revisionCount + 1}
            </button>
          )}
        </div>

        {/* Topic list */}
        <div style={{ flex: 1, overflowY: "auto", padding: "12px" }}>
          {topics.map((topic, idx) => (
            <TopicCard
              key={idx}
              topic={topic}
              index={idx}
              isSelected={selectedTopicIdx === idx}
              isCompleted={completedTopics.has(topic)}
              isGenerating={generatingTopics.has(topic)}
              onClick={() => loadTopic(topic, idx)}
            />
          ))}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div
        ref={contentRef}
        style={{ flex: 1, overflowY: "auto", background: "#fafafa" }}
      >
        {!content ? (
          <div className="d-flex flex-column align-items-center justify-content-center h-100 text-center p-4">
            <div className="spinner-border text-dark mb-3" style={{ width: "3rem", height: "3rem" }} />
            <h5 className="fw-bold">Generating content from NCERT...</h5>
            <p className="text-secondary">
              First-time generation takes 30-60 seconds.
              Once done, it's instantly available for all users!
            </p>
          </div>
        ) : (
          <div style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem" }}>

            {/* Topic header */}
            <div className="mb-4">
              <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
                <span className="badge bg-dark">{subject}</span>
                <span className="badge bg-secondary">Class {classNum}</span>
                <span className="badge" style={{ background: "#e8f5e9", color: "#2e7d32" }}>
                  📖 {content.readTime} read
                </span>
              </div>
              <h2 className="fw-bold mb-1">{content.topic}</h2>
              <p className="text-secondary">Chapter {chapterNum}: {content.chapterTitle}</p>
            </div>

            {/* Sections */}
            {content.sections?.map((section, i) => (
              <ContentSection
                key={i}
                section={section}
                onHighlight={saveHighlight}
              />
            ))}

            {/* Key Points */}
            {content.keyPoints?.length > 0 && (
              <div className="card mb-4 p-4" style={{ borderRadius: "16px", background: "#fff9e6", border: "1px solid #ffc10744" }}>
                <h6 className="fw-bold mb-3">🔑 Key Points — Must Remember</h6>
                {content.keyPoints.map((point, i) => (
                  <div key={i} className="d-flex gap-3 mb-2">
                    <span style={{ color: "#ffc107", fontWeight: 800 }}>→</span>
                    <span style={{ fontSize: "0.95rem" }}>{point}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Formulas */}
            {content.formulas?.length > 0 && (
              <div className="card mb-4 p-4" style={{ borderRadius: "16px", background: "#e3f2fd", border: "1px solid #2196f344" }}>
                <h6 className="fw-bold mb-3">🔢 Formulas</h6>
                {content.formulas.map((f, i) => (
                  <div key={i} className="p-3 rounded mb-2 bg-white">
                    <div className="fw-semibold small mb-1">{f.name}</div>
                    <MathRenderer content={`$${f.formula}$`} />
                    {f.unit && <small className="text-secondary">Unit: {f.unit}</small>}
                  </div>
                ))}
              </div>
            )}

            {/* NCERT Exact Lines */}
            {content.ncertExactLines?.length > 0 && (
              <div className="card mb-4 p-4" style={{ borderRadius: "16px", background: "#f3e5f5", border: "1px solid #9c27b044" }}>
                <h6 className="fw-bold mb-3">📌 NCERT Exact Lines — Memorize These</h6>
                {content.ncertExactLines.map((line, i) => (
                  <div
                    key={i}
                    className="p-3 rounded mb-2"
                    style={{
                      background: "white",
                      borderLeft: "3px solid #9c27b0",
                      fontStyle: "italic",
                      fontSize: "0.9rem",
                      cursor: "pointer"
                    }}
                    onMouseUp={() => {
                      const sel = window.getSelection();
                      if (sel?.toString()?.length > 10) {
                        saveHighlight(sel.toString(), "blue");
                      }
                    }}
                  >
                    "{line}"
                  </div>
                ))}
              </div>
            )}

            {/* Diagrams */}
            {content.diagrams?.length > 0 && (
              <div className="card mb-4 p-4" style={{ borderRadius: "16px", border: "1px solid #e9ecef" }}>
                <h6 className="fw-bold mb-3">🖼️ Diagrams in this Topic</h6>
                <p className="text-secondary small mb-3">
                  NCERT diagrams are essential. Search Google Images for accurate visuals:
                </p>
                {content.diagrams.map((d, i) => (
                  <div key={i} className="d-flex align-items-start gap-3 p-3 rounded mb-2 bg-light">
                    <span style={{ fontSize: "1.5rem" }}>🔍</span>
                    <div>
                      <div className="fw-semibold small">{d.title}</div>
                      <div className="text-secondary small mb-2">{d.description}</div>
                      <a
                        href={`https://www.google.com/search?q=${encodeURIComponent(d.searchQuery)}&tbm=isch`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-outline-dark"
                        style={{ borderRadius: "20px", fontSize: "0.75rem" }}
                      >
                        🔍 Search: {d.searchQuery}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Mnemonic */}
            {content.mnemonic && (
              <div
                className="card mb-4 p-4"
                style={{
                  borderRadius: "16px",
                  background: "linear-gradient(135deg, #667eea22, #764ba222)",
                  border: "1px solid #667eea44"
                }}
              >
                <h6 className="fw-bold mb-2">🧠 Memory Trick</h6>
                <p className="mb-0 fw-semibold" style={{ color: "#5c6bc0" }}>{content.mnemonic}</p>
              </div>
            )}

            {/* Fun fact */}
            {content.funFact && (
              <div
                className="card mb-4 p-4"
                style={{
                  borderRadius: "16px",
                  background: "#fff8e1",
                  border: "1px solid #ffc10744"
                }}
              >
                <h6 className="fw-bold mb-2">😄 Remember It Better</h6>
                <p className="mb-0">{content.funFact}</p>
              </div>
            )}

            {/* Common Errors */}
            {content.commonErrors?.length > 0 && (
              <div className="card mb-4 p-4" style={{ borderRadius: "16px", background: "#fff5f5", border: "1px solid #ff000022" }}>
                <h6 className="fw-bold mb-3 text-danger">⚠️ Don't Make These Mistakes</h6>
                {content.commonErrors.map((err, i) => (
                  <div key={i} className="d-flex gap-2 mb-2">
                    <span className="text-danger">✗</span>
                    <span className="small">{err}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Exam Tip */}
            {content.examTip && (
              <div
                className="card mb-4 p-4"
                style={{
                  borderRadius: "16px",
                  background: "#e8f5e9",
                  border: "1px solid #4caf5044"
                }}
              >
                <h6 className="fw-bold mb-2">🎯 Exam Strategy</h6>
                <p className="mb-0">{content.examTip}</p>
              </div>
            )}

            {/* Mark complete button */}
            <div className="text-center py-4">
              {completedTopics.has(topics[selectedTopicIdx]) ? (
                <div>
                  <div
                    className="d-inline-flex align-items-center gap-2 px-4 py-3 rounded-pill"
                    style={{ background: "#e8f5e9", color: "#2e7d32" }}
                  >
                    <span style={{ fontSize: "1.5rem" }}>✅</span>
                    <span className="fw-bold">Topic Completed!</span>
                  </div>
                  {selectedTopicIdx < topics.length - 1 && (
                    <button
                      className="btn btn-dark ms-3"
                      style={{ borderRadius: "20px" }}
                      onClick={() => {
                        const next = selectedTopicIdx + 1;
                        loadTopic(topics[next], next);
                        contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                    >
                      Next Topic →
                    </button>
                  )}
                </div>
              ) : (
                <button
                  className="btn btn-dark btn-lg px-5 py-3 fw-bold"
                  style={{ borderRadius: "30px" }}
                  onClick={markTopicComplete}
                >
                  ✓ Mark as Done — Next Topic
                </button>
              )}

              {progressPct === 100 && (
                <div className="mt-4">
                  <div
                    className="p-4 rounded-3"
                    style={{
                      background: "linear-gradient(135deg, #1a1a2e, #0f3460)",
                      color: "white"
                    }}
                  >
                    <div style={{ fontSize: "3rem" }}>🎉</div>
                    <h4 className="fw-bold mt-2">Chapter Complete!</h4>
                    <p className="opacity-75">
                      {revisionCount > 0
                        ? `Revision #${revisionCount} complete!`
                        : "First reading done. Revision time soon!"}
                    </p>
                    <button
                      className="btn btn-light fw-bold"
                      style={{ borderRadius: "20px" }}
                      onClick={resetProgress}
                    >
                      Start Revision 🔄
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default NCERTChapterReader;