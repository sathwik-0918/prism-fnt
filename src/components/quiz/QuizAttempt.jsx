// components/quiz/QuizAttempt.jsx
// one question at a time interface
// progress bar, next/prev, submit

import { useEffect, useRef, useState } from "react";
import MathRenderer from "../common/MathRenderer";

function QuizAttempt({ questions, onSubmit, onCancel }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flagged, setFlagged] = useState(new Set());

  const current = questions[currentIdx];
  const progress = ((currentIdx + 1) / questions.length) * 100;
  const answeredCount = Object.keys(answers).length;

  // Add timer state
  const [showTimer, setShowTimer] = useState(false);
  const [timeLimit, setTimeLimit] = useState(60);  // seconds per question
  const [timeLeft, setTimeLeft] = useState(60);
  const timerRef = useRef(null);

  function handleAnswer(questionIdx, key) {
    setAnswers(prev => {
      if (prev[questionIdx] === key) {
        // deselect if same option clicked
        const updated = { ...prev };
        delete updated[questionIdx];
        return updated;
      }
      return { ...prev, [questionIdx]: key };
    });
  }

  function toggleFlag() {
    setFlagged(prev => {
      const next = new Set(prev);
      next.has(currentIdx) ? next.delete(currentIdx) : next.add(currentIdx);
      return next;
    });
  }

  function handleSubmit() {
    if (answeredCount < questions.length) {
      const unanswered = questions.length - answeredCount;
      if (!window.confirm(`You have ${unanswered} unanswered question(s). Submit anyway?`)) return;
    }
    onSubmit(answers);
  }

  // Timer effect
  useEffect(() => {
    if (!showTimer) return;
    const resetTimer = setTimeout(() => setTimeLeft(timeLimit), 0);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          // auto advance on timeout
          if (currentIdx < questions.length - 1) {
            setCurrentIdx(i => i + 1);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      clearTimeout(resetTimer);
      clearInterval(timerRef.current);
    };
  }, [currentIdx, showTimer, timeLimit, questions.length]);

  return (
    <div>
      {/* header */}
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h5 className="fw-bold mb-0">
          Question {currentIdx + 1} of {questions.length}
        </h5>
        <div className="d-flex gap-2">
          <span className="badge bg-success">{answeredCount} answered</span>
          <span className="badge bg-warning text-dark">{flagged.size} flagged</span>
        </div>
      </div>

      {/* progress bar */}
      <div className="progress mb-4" style={{ height: "8px" }}>
        <div
          className="progress-bar bg-dark"
          style={{ width: `${progress}%`, transition: "width 0.3s" }}
        />
      </div>

      {/* Timer toggle */}
      <div className="d-flex align-items-center gap-2 mb-3">
        <div className="form-check form-switch mb-0">
          <input
            type="checkbox"
            className="form-check-input"
            checked={showTimer}
            onChange={e => setShowTimer(e.target.checked)}
          />
          <label className="form-check-label small">
            ⏱️ Timer per question
          </label>
        </div>
        {showTimer && (
          <select
            className="form-select form-select-sm"
            style={{ width: "auto" }}
            value={timeLimit}
            onChange={e => setTimeLimit(Number(e.target.value))}
          >
            <option value={30}>30 sec</option>
            <option value={60}>1 min</option>
            <option value={120}>2 min</option>
            <option value={180}>3 min</option>
          </select>
        )}
        {showTimer && (
          <div
            className="fw-bold ms-2"
            style={{
              color: timeLeft < 10 ? "#dc3545" : timeLeft < 20 ? "#ffc107" : "#28a745",
              minWidth: "40px"
            }}
          >
            {timeLeft}s
          </div>
        )}
      </div>

      {/* question card */}
      <div className="card shadow mb-4">
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-start mb-3">
            <span className={`badge ${flagged.has(currentIdx) ? "bg-warning text-dark" : "bg-light text-dark"}`}>
              {flagged.has(currentIdx) ? "🚩 Flagged" : `Q${currentIdx + 1}`}
            </span>
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={toggleFlag}
            >
              {flagged.has(currentIdx) ? "Remove Flag" : "🚩 Flag"}
            </button>
          </div>

          <div className="mb-4">
            <MathRenderer content={current.question} />
          </div>

          {/* options */}
          <div className="d-flex flex-column gap-2">
            {Object.entries(current.options || {}).map(([key, value]) => (
              <button
                key={key}
                className={`btn text-start p-3 w-100 mb-2 ${answers[currentIdx] === key
                  ? "btn-dark text-white"
                  : "btn-outline-secondary"
                  }`}
                style={{ borderRadius: "10px", transition: "all 0.15s" }}
                onClick={() => handleAnswer(currentIdx, key)}
                title={answers[currentIdx] === key ? "Click again to deselect" : ""}
              >
                <span className="fw-bold me-2">{key}.</span><MathRenderer content={value} />
                {answers[currentIdx] === key && (
                  <span className="ms-auto small opacity-50 float-end">click to deselect</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* navigation */}
      <div className="d-flex justify-content-between align-items-center">
        <button
          className="btn btn-outline-dark"
          onClick={() => setCurrentIdx(i => Math.max(0, i - 1))}
          disabled={currentIdx === 0}
        >
          ← Previous
        </button>

        {/* question dots */}
        <div className="d-flex gap-1 flex-wrap justify-content-center">
          {questions.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIdx(i)}
              className="btn btn-sm p-0"
              style={{
                width: "28px", height: "28px", borderRadius: "50%",
                background: answers[i]
                  ? "#212529"
                  : flagged.has(i)
                    ? "#ffc107"
                    : i === currentIdx
                      ? "#6c757d"
                      : "#dee2e6",
                color: answers[i] || i === currentIdx ? "white" : "black",
                fontSize: "11px", border: "none"
              }}
            >
              {i + 1}
            </button>
          ))}
        </div>

        {currentIdx < questions.length - 1 ? (
          <button
            className="btn btn-dark"
            onClick={() => setCurrentIdx(i => i + 1)}
          >
            Next →
          </button>
        ) : (
          <button
            className="btn btn-success fw-bold px-4"
            onClick={handleSubmit}
          >
            Submit Quiz ✓
          </button>
        )}
      </div>

      {/* cancel */}
      <div className="text-center mt-3">
        <button className="btn btn-sm btn-outline-danger" onClick={onCancel}>
          Cancel Quiz
        </button>
      </div>
    </div>
  );
}

export default QuizAttempt;