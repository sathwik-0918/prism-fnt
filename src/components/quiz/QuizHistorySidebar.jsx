// components/quiz/QuizHistorySidebar.jsx
// Left sidebar for quiz history — mirrors chat sidebar
// Shows all attempted quizzes with scores

import { useState, useEffect } from "react";
import { useUserContext } from "../../contexts/UserContext";
import axios from "axios";
import { getQuizById } from "../../services/api";

const BASE = "http://localhost:8000/api";

function QuizHistorySidebar({ isOpen, onClose, onSelectQuiz }) {
  const { currentUser } = useUserContext();
  const [history, setHistory] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser?.userId && isOpen) {
      loadHistory();
    }
  }, [currentUser?.userId, isOpen]);

  async function loadHistory() {
    setLoading(true);
    try {
      const [histRes, analysisRes] = await Promise.all([
        axios.get(`${BASE}/quiz/history/${currentUser.userId}`),
        axios.get(`${BASE}/quiz/overall-analysis/${currentUser.userId}`)
      ]);
      setHistory(histRes.data.payload || []);
      setAnalysis(analysisRes.data.payload);
    } catch (err) {
      console.error("Failed to load quiz history:", err);
    } finally {
      setLoading(false);
    }
  }

  function getScoreColor(score) {
    if (score >= 80) return "#28a745";
    if (score >= 50) return "#ffc107";
    return "#dc3545";
  }

  function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  }

  async function handleSelectQuiz(quiz) {
    if (!quiz._id) {
      console.error("[QuizSidebar] No _id on quiz:", quiz);
      return;
    }
    try {
      const res = await getQuizById(currentUser.userId, quiz._id);
      const fullQuiz = res.data.payload;
      if (fullQuiz && onSelectQuiz) {
        console.log("[QuizSidebar] Loaded quiz:", fullQuiz.topic);
        onSelectQuiz(fullQuiz);
      }
    } catch (err) {
      console.error("[QuizSidebar] Failed to load quiz:", err);
    }
  }

  return (
    <>
      {/* overlay */}
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
          width: "300px",
          zIndex: 1000,
          transform: isOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.3s ease",
          overflowY: "auto",
        }}
      >
        {/* header */}
        <div className="d-flex align-items-center justify-content-between p-3 border-bottom border-secondary">
          <span className="fw-bold fs-5">📝 Quiz History</span>
          <button className="btn btn-sm btn-outline-light" onClick={onClose}>✕</button>
        </div>

        {/* overall stats */}
        {analysis && (
          <div className="p-3 border-bottom border-secondary">
            <div className="row g-2 text-center">
              <div className="col-4">
                <div className="fw-bold fs-5">{analysis.totalQuizzes}</div>
                <small className="text-secondary">Total</small>
              </div>
              <div className="col-4">
                <div className="fw-bold fs-5" style={{ color: getScoreColor(analysis.averageScore) }}>
                  {analysis.averageScore}%
                </div>
                <small className="text-secondary">Avg Score</small>
              </div>
              <div className="col-4">
                <div className="fw-bold fs-5">{analysis.totalCorrect}</div>
                <small className="text-secondary">Correct</small>
              </div>
            </div>
          </div>
        )}

        {/* history list */}
        <div className="flex-grow-1 overflow-auto p-2">
          {loading ? (
            <div className="text-center mt-4">
              <div className="spinner-border spinner-border-sm text-light" />
            </div>
          ) : history.length === 0 ? (
            <p className="text-secondary small text-center mt-4 px-3">
              No quizzes yet. Generate your first quiz!
            </p>
          ) : (
            history.map((quiz, i) => (
              <div
                key={i}
                className="p-3 rounded mb-2 d-flex align-items-center gap-3"
                style={{ background: "rgba(255,255,255,0.07)", cursor: "pointer" }}
                onClick={() => handleSelectQuiz(quiz)}
              >
                {/* score circle */}
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
                  style={{
                    width: "44px", height: "44px",
                    background: getScoreColor(quiz.scorePercent),
                    fontSize: "0.85rem"
                  }}
                >
                  {quiz.scorePercent}%
                </div>

                <div className="flex-grow-1 overflow-hidden">
                  <div className="fw-semibold small text-truncate">{quiz.topic}</div>
                  <div className="d-flex gap-2">
                    <small className="text-secondary">{quiz.difficulty}</small>
                    <small className="text-secondary">·</small>
                    <small className="text-secondary">{quiz.totalQuestions}Q</small>
                    <small className="text-secondary">·</small>
                    <small className="text-secondary">{formatDate(quiz.completedAt)}</small>
                  </div>
                </div>

                {/* mini result */}
                <div className="text-end flex-shrink-0">
                  <small className="text-success d-block">{quiz.correct}✓</small>
                  <small className="text-danger d-block">{quiz.wrong}✗</small>
                </div>
              </div>
            ))
          )}
        </div>

        {/* user info */}
        <div className="p-3 border-top border-secondary">
          <small className="text-secondary">{currentUser?.firstName} — {currentUser?.examTarget}</small>
        </div>
      </div>
    </>
  );
}

export default QuizHistorySidebar;