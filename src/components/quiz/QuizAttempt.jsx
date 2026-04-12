// components/quiz/QuizAttempt.jsx
// one question at a time interface
// progress bar, next/prev, submit

import { useState } from "react";
import MathRenderer from "../common/MathRenderer";

function QuizAttempt({ questions, onSubmit, onCancel }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flagged, setFlagged] = useState(new Set());

  const current = questions[currentIdx];
  const progress = ((currentIdx + 1) / questions.length) * 100;
  const answeredCount = Object.keys(answers).length;

  function handleAnswer(questionIdx, answer) {
    setAnswers(prev => ({ ...prev, [questionIdx]: answer }));
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
                className={`btn text-start p-3 ${
                  answers[currentIdx] === key
                    ? "btn-dark text-white"
                    : "btn-outline-secondary"
                }`}
                style={{ borderRadius: "10px" }}
                onClick={() => handleAnswer(currentIdx, key)}
              >
                <span className="fw-bold me-2">{key}.</span><MathRenderer content={value} />
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